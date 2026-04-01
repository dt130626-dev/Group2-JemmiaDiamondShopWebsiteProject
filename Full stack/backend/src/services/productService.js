import Product from "../models/Product.js";

export const fetchAllProducts = async () => {
  return await Product.find().sort("-createdAt");
};

export const fetchProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Không tìm thấy sản phẩm");
  return product;
};

export const createNewProduct = async (productData, userId) => {
  return await Product.create({ 
    ...productData, 
    createdBy: userId 
  });
};

export const updateProductLogic = async (id, updateData) => {
  
  if (updateData.countInStock !== undefined && updateData.countInStock < 0) {
    throw new Error("Số lượng tồn kho không được là số âm");
  }

 
  const product = await Product.findByIdAndUpdate(id, updateData, { 
    new: true,
    runValidators: true 
  });

  if (!product) throw new Error("Không tìm thấy sản phẩm");
  
  return product;
};

export const removeProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new Error("Không tìm thấy sản phẩm");
  return true;
};