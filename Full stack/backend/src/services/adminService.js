import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const getStatsLogic = async () => {
  const [totalUsers, totalProducts, totalOrders, paidOrders] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.find({ paymentStatus: "paid" }),
  ]);


  const revenue = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);

 
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    revenue,
    ordersByStatus,
  };
};

export const fetchAllUsersAdmin = async () => {
  return await User.find().select("-password").sort("-createdAt");
};

export const deleteUserById = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error("Không tìm thấy người dùng để xóa");
  return true;
};