import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catch.async";
import { createAppError } from "../utils/error.util";
import { prisma } from "../lib/prisma";
import { comparePassword, hashPassword } from "../utils/password.util";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.util";
import { cookieOptions } from "../utils/cookie.util";
import { hashToken } from "../utils/token.util";

export const register = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!email || !password)
    return next(createAppError("Please enter your email and password.", 400));

  const existing_user = await prisma.user.findUnique({
    where: { email },
  });

  if (existing_user)
    return next(createAppError("This user already exists.", 400));

  const hash_password = await hashPassword(password);

  const create_user = await prisma.user.create({
    data: {
      username,
      email,
      password: hash_password,
    },
    omit: { password: true },
  });

  return res.status(201).json({
    status: "success",
    message: "Registration completed successfully",
    data: {
      create_user,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return next(createAppError("Please enter email and password", 400));

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await comparePassword(user.password, password))) {
    return next(createAppError("Email or password is incorrect", 401));
  }

  if (!user.isVerified) {
    return res.status(403).json({
      status: "fail",
      message: "Please confirm your email first.",
    });
  }

  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  const access_token = signAccessToken(user.id);
  const refresh_token = signRefreshToken(user.id);

  const hashed_refresh_token = hashToken(refresh_token);

  await prisma.refreshToken.create({
    data: {
      token: hashed_refresh_token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
    },
  });

  res.cookie("refreshToken", refresh_token, cookieOptions);

  res.status(200).json({
    status: "success",
    accessToken: access_token,
  });
});

export const refreshToken = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) return next(createAppError("Refresh not found", 401));

  const verify = verifyRefreshToken(token);

  const hashed_token = hashToken(token);

  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      token: hashed_token,
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

    res.clearCookie("refreshToken");

    return next(
      createAppError("Token reuse detected. All sessions revoked.", 401),
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: verify.id },
  });

  if (!user) return next(createAppError("User does not exist", 401));

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: {
      isRevoked: true,
    },
  });

  const new_refresh_token = signRefreshToken(user.id);
  const hashed_new_token = hashToken(new_refresh_token);

  await prisma.refreshToken.create({
    data: {
      token: hashed_new_token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
    },
  });

  const new_access_token = signAccessToken(user.id);

  res.cookie("refreshToken", new_refresh_token, cookieOptions);

  res.status(200).json({
    status: "success",
    accessToken: new_access_token,
  });
});

export const logout = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    const hased_token = hashToken(token);

    await prisma.refreshToken.deleteMany({
      where: { token: hased_token },
    });
  }

  const { maxAge, ...clearOption } = cookieOptions;

  res.clearCookie("refreshToken", clearOption);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  const userId = req.user?.id;

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

  if (!user) return next(createAppError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: { user },
  });
});
