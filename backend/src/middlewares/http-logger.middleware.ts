import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

/**
 * HTTP Request/Response logging middleware
 * Logs incoming requests and outgoing responses
 */
export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log incoming request
  logger.http(`[${req.method}] ${req.path} - IP: ${req.ip}`);

  // Override res.send to log response
  const originalSend = res.send;

  res.send = function (data: unknown): Response {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log response
    if (statusCode >= 400) {
      logger.warn(`[${req.method}] ${req.path} - Status: ${statusCode} - Duration: ${duration}ms`);
    } else {
      logger.debug(`[${req.method}] ${req.path} - Status: ${statusCode} - Duration: ${duration}ms`);
    }

    return originalSend.call(this, data);
  };

  next();
};
