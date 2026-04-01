import asyncHandler from "express-async-handler";
import * as adminService from "../services/adminService.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getStatsLogic();
  res.json({ success: true, stats });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await adminService.fetchAllUsersAdmin();
  res.json({ success: true, users });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUserById(req.params.id);
  res.json({ success: true, message: "Đã xóa user thành công" });
});