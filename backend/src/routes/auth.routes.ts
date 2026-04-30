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

const route = Router();

route.post("/register", authLimiter, validateInput(registerSchema), register);
route.post("/login", authLimiter, validateInput(loginSchema), login);

route.post("/refresh-token", refreshToken);

route.get("/get-me", protect, getMe);
route.post("/logout", protect, logout);

export default route;
