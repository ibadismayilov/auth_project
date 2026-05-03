import { redisClient } from "../lib/redis";
import { catchAsync } from "../utils/catch.async";
import { createAppError } from "../utils/error.util";

export const checkIpBan = catchAsync(async (req, _res, next) => {
  const ip =
    req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress;

  if (!ip) return next();

  const banned = await redisClient.get(`ban:ip:${ip}`);

  if (banned) return next(createAppError("IP banned", 403));

  next();
});
