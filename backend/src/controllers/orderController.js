import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, note } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    res.status(400); 
    throw new Error("Giỏ hàng trống");
  }


  for (const item of cart.items) {
    if (item.product.countInStock < item.quantity) {
      res.status(400);
      throw new Error(`Sản phẩm "${item.product.name}" không đủ số lượng trong kho`);
    }
  }

  const items = cart.items.map((i) => ({
    product:  i.product._id,
    name:     i.product.name,
    image:    i.product.image,
    price:    i.price,
    quantity: i.quantity,
  }));

  const totalPrice = cart.totalPrice;


  const order = await Order.create({
    user: req.user._id,
    items, 
    shippingAddress, 
    paymentMethod, 
    note, 
    totalPrice,
  });

 
  await User.findByIdAndUpdate(req.user._id, {
    name: shippingAddress.fullName,
    phone: shippingAddress.phone,
    address: shippingAddress.address
  });


  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { countInStock: -item.quantity }
    });
  }

 
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(201).json({ success: true, order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.json({ success: true, orders });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) { 
    res.status(404); 
    throw new Error("Không tìm thấy đơn hàng"); 
  }
  res.json({ success: true, order });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { 
    res.status(404); 
    throw new Error("Không tìm thấy đơn hàng"); 
  }
  if (!["processing", "confirmed"].includes(order.orderStatus)) {
    res.status(400); 
    throw new Error("Không thể hủy đơn hàng đang giao");
  }

  order.orderStatus  = "cancelled";
  order.cancelReason = req.body.reason || "Khách hàng hủy";
  await order.save();

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { countInStock: item.quantity } 
    });
  }

  res.json({ success: true, order });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "name email").sort("-createdAt");
  res.json({ success: true, orders });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { 
    res.status(404); 
    throw new Error("Không tìm thấy đơn hàng"); 
  }

  order.orderStatus = req.body.status;
  if (req.body.status === "delivered") {
    order.paymentStatus = "paid";
    order.deliveredAt   = Date.now();
  }
  await order.save();
  res.json({ success: true, order });
});