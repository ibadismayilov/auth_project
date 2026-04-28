import { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  if (err.isOperational) {
    return res.status(statusCode).json({
      status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  console.error("ERROR ", err);
  return res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};
