import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { getSafeIp } from "../utils/ip.util";

export const commonLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request, _res: Response): string => {
    return `rl:common:${getSafeIp(req)}`;
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      status: "error",
      message: "Too many requests. Please wait a moment..",
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request, _res: Response): string => {
    const ip = getSafeIp(req);
    const email = (req.body as { email?: string })?.email || "unknown";
    return `rl:auth:${ip}:${email}`;
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      status: "error",
      message: "Too many failed login attempts. Please check again in 1 hour.",
    });
  },
});

export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request, _res: Response): string => {
    return `rl:admin:${getSafeIp(req)}`;
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      status: "error",
      message: "The allowed limit for the admin panel has been exceeded.",
    });
  },
});
