import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  errors?: [];
}

export const globalErrorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  // Log the error
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} - ${err.message}`, {
      stack: err.stack,
      statusCode,
      path: req.path,
      method: req.method,
    });
  } else if (statusCode >= 400) {
    logger.warn(`[${req.method}] ${req.path} - ${err.message}`, {
      statusCode,
      path: req.path,
      method: req.method,
    });
  }

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

  logger.error("UNHANDLED ERROR:", {
    error: err,
    stack: err.stack,
  });

  return res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};
