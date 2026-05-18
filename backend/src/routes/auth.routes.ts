import { Router } from "express";
import validateInput from "../middlewares/validate.middleware";
import { loginSchema, registerSchema, verifyOtpSchema } from "../validators/auth.validator";
import {
  getMe,
  login,
  logout,
  refreshToken,
  register,
  verifyOTP,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";
import { authLimiter } from "../config/limiter.config";
import { progressiveRateLimit } from "../middlewares/redis.rate-limiter";
import { ipRateLimit } from "../middlewares/ip.rate-limiter";
import { checkIpBan } from "../middlewares/ip.ban.middleware";

const route = Router();

route.post("/register", authLimiter, validateInput(registerSchema), register);

route.post(
  "/login",
  checkIpBan,
  authLimiter,
  validateInput(loginSchema),
  ipRateLimit(20, 60),
  progressiveRateLimit(5, 60),
  login
);

route.post(
  "/refresh-token",
  checkIpBan,
  ipRateLimit(30, 60),
  progressiveRateLimit(20, 60),
  refreshToken
);

route.post(
  "/verify-otp",
  checkIpBan,
  authLimiter,
  validateInput(verifyOtpSchema),
  ipRateLimit(10, 60),
  progressiveRateLimit(5, 60),
  verifyOTP
);

route.get("/get-me", protect, checkIpBan, progressiveRateLimit(50, 60), getMe);
route.post("/logout", protect, logout);

export default route;
