import Product from "../models/Product.js";
import ApiFeatures from "../utils/ApiFeatures.js";

export const getAllProducts = async (query) => {
  const total    = await Product.countDocuments({ isActive: true });
  const features = new ApiFeatures(Product.find({ isActive: true }), query)
    .filter().sort().limitFields().paginate();
  const products = await features.query;
  return { products, total, page: features.page, totalPages: Math.ceil(total / features.limit) };
};

export const getProductBySlug = async (slug) => {
  return await Product.findOne({ slug, isActive: true });
};

export const createProduct = async (data) => {
  return await Product.create(data);
};

export const updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};