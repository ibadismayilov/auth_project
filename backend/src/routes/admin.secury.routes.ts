import { Router } from "express";
import { adminBanIp, adminUnbanIp } from "../controllers/admin.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import validateInput from "../middlewares/validate.middleware";
import { banIpSchema, unbanIpSchema } from "../validators/auth.validator";

const router = Router();

router.post("/ban-ip", protect, authorizeRoles(["ADMIN"]), validateInput(banIpSchema), adminBanIp);

router.post(
  "/unban-ip",
  protect,
  authorizeRoles(["ADMIN"]),
  validateInput(unbanIpSchema),
  adminUnbanIp
);

export default router;
