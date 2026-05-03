import { redisClient } from "../lib/redis";
import { redisKeys } from "../utils/redisKey.util";
import { createAppError } from "../utils/error.util";
import { catchAsync } from "../utils/catch.async";

export const userRateLimit = (limit: number, windowSec: number) => {
  return catchAsync(async (req, _res, next) => {
    const userId = req.user?.id;

    if (!userId) return next();

    const key = redisKeys.rateLimit(userId);

    const current = await redisClient.incr(key);

    if (current === 1) await redisClient.expire(key, windowSec);

    if (current > limit)
      return next(
        createAppError("Too many requests (user limit exceeded)", 429),
      );

    next();
  });
};
