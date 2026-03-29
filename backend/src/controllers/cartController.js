import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product", "name image price countInStock");
  res.json({ success: true, cart: cart || { items: [], totalPrice: 0 } });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) { res.status(404); throw new Error("Sản phẩm không tồn tại"); }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existIndex = cart.items.findIndex((i) => i.product.toString() === productId);
  if (existIndex >= 0) {
    cart.items[existIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, price: product.price });
  }

  await cart.save();
  await cart.populate("items.product", "name image price countInStock");
  res.json({ success: true, cart });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error("Giỏ hàng trống"); }

  const item = cart.items.id(req.params.itemId);
  if (!item) { res.status(404); throw new Error("Không tìm thấy sản phẩm trong giỏ"); }

  if (quantity <= 0) {
    cart.items.pull({ _id: req.params.itemId });
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate("items.product", "name image price countInStock"); // ✅
  res.json({ success: true, cart });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  cart.items.pull({ _id: req.params.itemId });
  await cart.save();
  await cart.populate("items.product", "name image price countInStock"); // ✅
  res.json({ success: true, cart });
});

export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ success: true, message: "Đã xóa giỏ hàng" });
});