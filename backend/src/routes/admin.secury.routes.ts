import { Router } from "express";
import { adminBanIp, adminUnbanIp } from "../controllers/admin.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.post("/ban-ip", protect, authorizeRoles(["ADMIN"]), adminBanIp);

router.post("/unban-ip", protect, authorizeRoles(["ADMIN"]), adminUnbanIp);

export default router;
