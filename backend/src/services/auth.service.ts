import { prisma } from "../lib/prisma";
import { comparePassword, hashPassword } from "../utils/password.util";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.util";
import { hashToken } from "../utils/token.util";
import { createAppError } from "../utils/error.util";
import { AUTH_CONFIG } from "../config/auth.config";
import { redisClient } from "../lib/redis";
import { redisKeys } from "../utils/redisKey.util";
import { generateOTP } from "../utils/otp.util";
import { sendUserEmail } from "../lib/resend";
import { getVerificationEmailTemplate } from "../utils/email.templates.util";

// ---------------- REGISTER ----------------
export const registerUser = async (userData: IRegisterInput & { ipAddress: string }) => {
  const { username, email, password, ipAddress } = userData;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser && existingUser.isVerified === true)
    throw createAppError("This user already exists.", 400);

  const rateKey = redisKeys.emailRateLimit(email);
  const isRateLimited = await redisClient.get(rateKey);

  if (isRateLimited)
    throw createAppError(
      "Too many requests. Please wait 1 minute before requesting a new OTP.",
      429
    );

  const code = generateOTP();
  const hashedPassword = await hashPassword(password);

  let user;

  if (existingUser && existingUser.isVerified === false) {
    user = await prisma.user.update({
      where: { email },
      data: {
        username,
        password: hashedPassword,
        ipAddress: ipAddress,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isVerified: false,
        ipAddress: ipAddress,
      },
    });
  }

  const otpKey = redisKeys.otp(email);

  await redisClient.set(rateKey, "true", {
    EX: 60,
  });

  await redisClient.set(otpKey, code, {
    EX: 300,
  });

  await sendUserEmail({
    userEmail: email,
    subject: "Your Verification Code",
    htmlContent: getVerificationEmailTemplate(username, code),
  });

  return user;
};

// ---------------- LOGIN ----------------
export const loginUser = async (loginData: ILoginInput) => {
  const { email, password } = loginData;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await comparePassword(user.password, password)))
    throw createAppError("Email or password is incorrect", 401);

  if (!user.isVerified) throw createAppError("Please confirm your email first.", 403);

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  const hashedRefreshToken = hashToken(refreshToken);

  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  await prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN),
    },
  });

  await redisClient.setEx(
    redisKeys.session(user.id, hashedRefreshToken),
    Math.floor(AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN / 1000),
    JSON.stringify({
      userId: user.id,
      isRevoked: false,
      createdAt: Date.now(),
    })
  );

  return { accessToken, refreshToken, user };
};

// ---------------- REVOKE ALL ----------------
export const revokeAllUserSessions = async (userId: string) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });

  const keys = await redisClient.keys(`session:${userId}:*`);

  for (const key of keys) await redisClient.del(key);
};

// ---------------- REFRESH ----------------
export const refreshUserToken = async (token: string) => {
  const verify = verifyRefreshToken(token) as ITokenPayload;
  const oldTokenHash = hashToken(token);

  const sessionKey = redisKeys.session(verify.id, oldTokenHash);
  const cachedSession = await redisClient.get(sessionKey);

  if (!cachedSession) throw createAppError("Session expired. Please login again.", 401);

  const sessionData = JSON.parse(cachedSession);

  // DB fallback check
  const dbToken = await prisma.refreshToken.findUnique({
    where: { token: oldTokenHash },
  });

  if (!dbToken) throw createAppError("Invalid session. Please login again.", 401);

  // ---------------- REUSE DETECTION ----------------
  if (sessionData.isRevoked) {
    let revokedAt = sessionData.revokedAt;

    if (!revokedAt) revokedAt = dbToken.revokedAt?.getTime();

    if (!revokedAt) throw createAppError("Invalid session state", 401);

    const timeSinceRevoke = Date.now() - revokedAt;

    if (timeSinceRevoke < AUTH_CONFIG.GRACE_PERIOD)
      throw createAppError("Processing request, please wait.", 429);

    // REAL ATTACK → logout all devices
    await revokeAllUserSessions(verify.id);

    await prisma.refreshToken.updateMany({
      where: { userId: verify.id },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });

    throw createAppError("Security Alert: Token reuse detected!", 401);
  }

  // ---------------- ROTATION ----------------
  const newAccessToken = signAccessToken(verify.id);
  const newRefreshToken = signRefreshToken(verify.id);
  const newTokenHash = hashToken(newRefreshToken);

  // old token revoke (grace period)
  await redisClient.setEx(
    sessionKey,
    Math.floor(AUTH_CONFIG.GRACE_PERIOD / 1000),
    JSON.stringify({
      ...sessionData,
      isRevoked: true,
      revokedAt: Date.now(),
    })
  );

  // new session
  await redisClient.setEx(
    redisKeys.session(verify.id, newTokenHash),
    Math.floor(AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN / 1000),
    JSON.stringify({
      userId: verify.id,
      isRevoked: false,
      createdAt: Date.now(),
    })
  );

  // DB update
  await prisma.refreshToken.update({
    where: { token: oldTokenHash },
    data: {
      replacedBy: newTokenHash,
      isRevoked: true,
      revokedAt: new Date(),
    },
  });

  await prisma.refreshToken.create({
    data: {
      token: newTokenHash,
      userId: verify.id,
      expiresAt: new Date(Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN),
    },
  });

  return { newAccessToken, newRefreshToken };
};

//Get User
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

export const verifyUserOTP = async (verifyData: IVerifyInput) => {
  const { email, code } = verifyData;

  const otpKey = redisKeys.otp(email);
  const cachedCode = await redisClient.get(otpKey);

  if (!cachedCode) throw createAppError("Verification code has expired or does not exist.", 400);

  if (cachedCode !== code) throw createAppError("Invalid verification code.", 400);

  const user = await prisma.user.update({
    where: { email },
    data: { isVerified: true },
    omit: { password: true },
  });

  await redisClient.del(otpKey);

  const refreshToken = signRefreshToken(user.id);
  const accessToken = signAccessToken(user.id);
  const hashedRefreshToken = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN),
    },
  });

  await redisClient.setEx(
    redisKeys.session(user.id, hashedRefreshToken),
    Math.floor(AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN / 1000),
    JSON.stringify({
      userId: user.id,
      isRevoked: false,
      createdAt: Date.now(),
    })
  );

  return { user, accessToken, refreshToken };
};
