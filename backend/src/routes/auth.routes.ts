import { Router } from "express";
import validateInput from "../middlewares/validate.middleware";
import { registerSchema } from "../validators/auth.validator";

const route = Router();

// route.post("/register", validateInput(registerSchema));

export default route;