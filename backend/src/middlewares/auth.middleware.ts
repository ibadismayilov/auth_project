import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catch.async";
import jwt from "jsonwebtoken";
import { createAppError } from "../utils/error.util";
import { verifyAccessToken } from "../utils/jwt.util";
import { prisma } from "../lib/prisma";

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization?.startsWith("Bearer"))
      token = req.headers.authorization.split(" ")[1];

    if (!token)
      return next(createAppError("You are not logged in! Log in.", 401));

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
