import { catchAsync } from "../utils/catch.async";
import * as AdminService from "../services/admin.service";

export const adminBanIp = catchAsync(async (req, res) => {
  const { ip } = req.body;

  await AdminService.banIp(ip, 24 * 60 * 60);

  res.status(200).json({
    status: "success",
    message: "IP banned successfully",
  });
});

export const adminUnbanIp = catchAsync(async (req, res) => {
  const { ip } = req.body;

  await AdminService.unbanIp(ip);

  res.status(200).json({
    status: "success",
    message: "IP unbanned successfully",
  });
});
