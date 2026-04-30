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

const route = Router();

route.post("/register", validateInput(registerSchema), register);
route.post("/login", validateInput(loginSchema), login);

route.post("/refresh-token", refreshToken);

route.get("/get-me", protect, getMe);
route.post("/logout", protect, logout);

export default route;
