import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catch.async";
import jwt from "jsonwebtoken";
import { createAppError } from "../utils/error.util";
import { verifyAccessToken } from "../utils/jwt.util";
import { prisma } from "../lib/prisma";

export const protect = catchAsync(
  async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(createAppError("Unauthorized", 401));
    }

    const token = authHeader.split(" ")[1];

    const verify = verifyAccessToken(token);

    const current_user = await prisma.user.findUnique({
      where: { id: verify.id },
      omit: { password: true }
    });

    if (!current_user)
      return next(
        createAppError("The user with this token no longer exists.", 401),
      );

    req.user = current_user;

    next();
  },
);