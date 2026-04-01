import asyncHandler from "express-async-handler";
import * as orderService from "../services/orderService.js";

export const createOrder = asyncHandler(async (req, res) => {

  const order = await orderService.createNewOrder(req.user._id, req.body);
  res.status(201).json({ success: true, order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user._id);
  res.json({ success: true, orders });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderDetails(req.params.id);
  res.json({ success: true, order });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrderLogic(req.params.id, req.body.reason);
  res.json({ success: true, order });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.fetchAllOrdersAdmin();
  res.json({ success: true, orders });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatusLogic(req.params.id, req.body.status);
  res.json({ success: true, order });
});