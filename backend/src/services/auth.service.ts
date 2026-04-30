import { prisma } from "../lib/prisma";
import { comparePassword, hashPassword } from "../utils/password.util";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.util";
import { hashToken } from "../utils/token.util";
import { createAppError } from "../utils/error.util";

export const registerUser = async (userData: any) => {
  const { username, email, password } = userData;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw createAppError("This user already exists.", 400);

  const hashedPassword = await hashPassword(password);

  return await prisma.user.create({
    data: { username, email, password: hashedPassword },
    omit: { password: true },
  });
};

export const loginUser = async (loginData: any) => {
  const { email, password } = loginData;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(user.password, password))) {
    throw createAppError("Email or password is incorrect", 401);
  }

  if (!user.isVerified)
    throw createAppError("Please confirm your email first.", 403);

  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  const hashedRefreshToken = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken, user };
};

export const refreshUserToken = async (token: string) => {
  const verify = verifyRefreshToken(token);
  const hashedToken = hashToken(token);

  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      token: hashedToken,
      userId: verify.id,
      expiresAt: { gt: new Date() },
      isRevoked: false,
    },
  });

  if (!storedToken) {
    await prisma.refreshToken.updateMany({
      where: { userId: verify.id },
      data: { isRevoked: true },
    });
    throw createAppError("Token reuse detected. All sessions revoked.", 401);
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { isRevoked: true },
  });

  const newRefreshToken = signRefreshToken(verify.id);
  const newAccessToken = signAccessToken(verify.id);

  await prisma.refreshToken.create({
    data: {
      token: hashToken(newRefreshToken),
      userId: verify.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { newAccessToken, newRefreshToken };
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) throw createAppError("User not found", 404);

  return user;
};
