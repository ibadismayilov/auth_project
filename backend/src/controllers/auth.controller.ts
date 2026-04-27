import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catch.async";
import { createAppError } from "../utils/error.util";
import { prisma } from "../lib/prisma";
import { comparePassword, hashPassword } from "../utils/password.util";
import { signToken } from "../utils/jwt.util";

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return createAppError("Please enter your email and password.", 400);

    const existing_user = await prisma.user.findUnique({
      where: { email },
    });

    if (!existing_user) return createAppError("This user already exists.", 400);

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
      date: {
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

    const create_token = await signToken(user.id);

    res.status(200).json({
      status: "success",
      create_token,
      data: {
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
        },
      },
    });
  },
);

export const logout = (req: Request, res: Response) => {

  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 5 * 1000), 
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Successfully performed.",
  });
};
