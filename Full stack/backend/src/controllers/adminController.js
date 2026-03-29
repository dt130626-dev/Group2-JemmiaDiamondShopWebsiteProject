import asyncHandler from "express-async-handler";
import User    from "../models/User.js";
import Product from "../models/Product.js";
import Order   from "../models/Order.js";


export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalProducts, totalOrders, orders] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.find({ paymentStatus: "paid" }),
  ]);

  const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  const ordersByStatus = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
      ordersByStatus,
    },
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort("-createdAt");
  res.json({ success: true, users });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Đã xóa user" });
});