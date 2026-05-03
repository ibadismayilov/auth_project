import { Request, Response, NextFunction } from "express";
import { createAppError } from "../utils/error.util";
import { catchAsync } from "../utils/catch.async";

export const authorizeRoles = (roles: string[]) => {
  return catchAsync(async (req, _res, next) => {
    const user = req.user;

    if (!user) return next(createAppError("Unauthorized", 401));

    if (!roles.includes(user.role))
      return next(createAppError("Forbidden: insufficient permissions", 403));

    next();
  });
};
