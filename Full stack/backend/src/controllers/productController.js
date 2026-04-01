import asyncHandler from "express-async-handler";
import * as productService from "../services/productService.js";


export const getProducts = asyncHandler(async (req, res) => {
  const products = await productService.fetchAllProducts();
  res.json({ success: true, products });
});


export const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.fetchProductById(req.params.id);
  res.json({ success: true, product });
});


export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createNewProduct(req.body, req.user._id);
  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProductLogic(req.params.id, req.body);
  res.json({ success: true, product });
});


export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.removeProduct(req.params.id);
  res.json({ success: true, message: "Đã xóa sản phẩm" });
});