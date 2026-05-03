import { catchAsync } from "../utils/catch.async";
import * as AuthService from "../services/auth.service";
import { hashToken } from "../utils/token.util";
import { prisma } from "../lib/prisma";
import { createAppError } from "../utils/error.util";
import { cookieOptions } from "../config/cookie.config";
import { redisClient } from "../lib/redis";

//REGISTER
export const register = catchAsync(async (req, res) => {
  const user = await AuthService.registerUser(req.body);

  res.status(201).json({ status: "success", data: { user } });
});

//LOGIN
export const login = catchAsync(async (req, res) => {
  const { accessToken, refreshToken } = await AuthService.loginUser(req.body);

  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.status(200).json({ status: "success", accessToken });
});

//REFRESH TOKEN
export const refreshToken = catchAsync(async (req, res) => {
  const token = req.signedCookies.refreshToken;

  if (!token) throw createAppError("No refresh token provided", 401);

  const { newAccessToken, newRefreshToken } =
    await AuthService.refreshUserToken(token);

  res.cookie("refreshToken", newRefreshToken, cookieOptions);

  res.status(200).json({
    status: "success",
    accessToken: newAccessToken,
  });
});

//LOGOUT
export const logout = catchAsync(async (req, res) => {
  const token = req.signedCookies.refreshToken;

  if (token) {
    const hashedToken = hashToken(token);

    await prisma.refreshToken.deleteMany({
      where: { token: hashToken(token) },
    });

    const keys = await redisClient.keys(`session:*:${hashedToken}`);

    for (const key of keys) await redisClient.del(key);
  }

  const { maxAge, ...clearOption } = cookieOptions;

  res.clearCookie("refreshToken", clearOption);
  res.status(200).json({ status: "success", message: "Logged out" });
});

//GET-ME
export const getMe = catchAsync(async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) return next(createAppError("You are not logged in", 401));

  const user = await AuthService.getUserById(userId);

  res.status(200).json({
    status: "success",
    data: { user },
  });
});
