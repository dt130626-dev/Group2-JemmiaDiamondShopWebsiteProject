import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";


export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.json({ success: true, products });
});


export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Không tìm thấy sản phẩm"); }
  res.json({ success: true, product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, product });
});


export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) { res.status(404); throw new Error("Không tìm thấy sản phẩm"); }
  res.json({ success: true, product });
});


export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) { res.status(404); throw new Error("Không tìm thấy sản phẩm"); }
  res.json({ success: true, message: "Đã xóa sản phẩm" });
});