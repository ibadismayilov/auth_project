import { redisClient } from "../lib/redis";
import { catchAsync } from "../utils/catch.async";
import { createAppError } from "../utils/error.util";

export const ipRateLimit = (limit: number, windowSec: number) => {
  return catchAsync(async (req, _res, next) => {
    const ip =
      req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress;

    if (!ip) return next();

    const key = `rate:ip:${ip}`;

    const current = await redisClient.incr(key);

    if (current === 1) await redisClient.expire(key, windowSec);

    if (current > limit)
      return next(createAppError("Too many requests from this IP", 429));
    
    next();
  });
};
