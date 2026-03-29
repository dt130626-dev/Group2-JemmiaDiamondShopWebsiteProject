import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const createOrderFromCart = async (userId, { shippingAddress, paymentMethod, note }) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) throw new Error("Giỏ hàng trống");

  const items = cart.items.map((i) => ({
    product:  i.product._id,
    name:     i.product.name,
    image:    i.product.images[0],
    price:    i.price,
    quantity: i.quantity,
    size:     i.size,
  }));

  const itemsPrice    = cart.totalPrice;
  const shippingPrice = itemsPrice >= 500000 ? 0 : 30000;
  const totalPrice    = itemsPrice + shippingPrice - cart.discount;

  const order = await Order.create({
    user: userId, items, shippingAddress, paymentMethod, note,
    itemsPrice, shippingPrice, discount: cart.discount, totalPrice,
  });

 
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    });
  }

  await Cart.findOneAndDelete({ user: userId });
  return order;
};

export const getOrdersByUser = async (userId) => {
  return await Order.find({ user: userId }).sort("-createdAt");
};

export const getOrderById = async (orderId) => {
  return await Order.findById(orderId).populate("user", "name email");
};

export const updateStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Không tìm thấy đơn hàng");
  order.orderStatus = status;
  if (status === "delivered") {
    order.paymentStatus = "paid";
    order.deliveredAt   = Date.now();
  }
  return await order.save();
};