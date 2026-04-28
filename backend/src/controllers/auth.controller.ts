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

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return createAppError("Please enter your email and password.", 400);

    const existing_user = await prisma.user.findUnique({
      where: { email },
    });

    if (existing_user) return createAppError("This user already exists.", 400);

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
  },
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password)
      return createAppError("Please enter email and password", 400);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await comparePassword(password, user.password))) {
      return next(createAppError("The email or password is incorrec", 401));
    }

    if (!user.isVerified) {
      return res.status(403).json({
        status: "fail",
        message: "Please confirm your email address first.",
      });
    }

    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    const access_token = signAccessToken(user.id);
    const refresh_token = signRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refresh_token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      access_token,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });
  },
);

export const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;

    if (!token) return next(createAppError("Refresh not found", 401));

    const verify = verifyRefreshToken(token);

    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: token,
        userId: verify.id,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken)
      return next(createAppError("The session is invalid", 401));

    const user = await prisma.user.findUnique({
      where: { id: verify.id },
    });

    if (!user) return next(createAppError("User does not exist", 401));

    const new_access_token = signAccessToken(user.id);

    res.status(200).json({
      status: "success",
      accessToken: new_access_token,
    });
  },
);

export const logout = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await prisma.refreshToken.deleteMany({
      where: { token: token },
    });
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
  });

  res.status(200).json({
    status: "success",
    message: "Successfully performed.",
  });
});
