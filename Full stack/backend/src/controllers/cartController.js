import asyncHandler from "express-async-handler";
import * as cartService from "../services/cartService.js";

export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getUserCart(req.user._id);
  res.json({ success: true, cart });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await cartService.addItemToCart(req.user._id, productId, quantity);
  res.json({ success: true, cart });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await cartService.updateItemInCart(req.user._id, req.params.itemId, quantity);
  res.json({ success: true, cart });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItemFromCart(req.user._id, req.params.itemId);
  res.json({ success: true, cart });
});

export const clearCart = asyncHandler(async (req, res) => {
  await cartService.deleteUserCart(req.user._id);
  res.json({ success: true, message: "Đã xóa giỏ hàng" });
});