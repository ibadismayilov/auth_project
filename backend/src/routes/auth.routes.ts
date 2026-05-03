import { Router } from "express";
import validateInput from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import {
  getMe,
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";
import { authLimiter } from "../config/limiter.config";
import { userRateLimit } from "../middlewares/redis.rate-limiter";
import { ipRateLimit } from "../middlewares/ip.rate-limiter";
import { checkIpBan } from "../middlewares/ip.ban.middleware";

const route = Router();

route.post("/register", authLimiter, validateInput(registerSchema), register);
route.post(
  "/login",
  authLimiter,
  userRateLimit(5, 60),
  ipRateLimit(20, 60),
  checkIpBan,
  validateInput(loginSchema),
  login,
);

route.post(
  "/refresh-token",
  userRateLimit(20, 60),
  ipRateLimit(30, 60),
  checkIpBan,
  refreshToken,
);

route.get("/get-me", protect, checkIpBan, userRateLimit(50, 60), getMe);
route.post("/logout", protect, logout);

export default route;
