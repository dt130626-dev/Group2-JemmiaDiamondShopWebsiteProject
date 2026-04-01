import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const createNewOrder = async (userId, orderData) => {
  const { shippingAddress, userDetails,paymentMethod, note } = orderData;


  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw new Error("Giỏ hàng trống");
  }


  for (const item of cart.items) {
    if (item.product.countInStock < item.quantity) {
      throw new Error(`Sản phẩm "${item.product.name}" không đủ số lượng trong kho`);
    }
  }


  const items = cart.items.map((i) => ({
    product: i.product._id,
    name: i.product.name,
    image: i.product.image,
    price: i.price,
    quantity: i.quantity,
  }));


  const order = await Order.create({
    user: userId,
    items,
    shippingAddress,
    paymentMethod,
    note,
    totalPrice: cart.totalPrice,
  });


  await User.findByIdAndUpdate(userId, {
    name: shippingAddress.fullName,
    phone: shippingAddress.phone,
    address: shippingAddress.address
  });


  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { countInStock: -item.quantity }
    });
  }
if (userDetails) {
    await User.findByIdAndUpdate(userId, {
      name: userDetails.name,
      phone: userDetails.phone,
      address: {
        street: userDetails.address.street,
        ward: userDetails.address.ward,
        district: userDetails.address.district,
        city: userDetails.address.city
      }
    });
  }

  await Cart.findOneAndDelete({ user: userId });
  
  return order;
};

export const getUserOrders = async (userId) => {
  return await Order.find({ user: userId }).sort("-createdAt");
};

export const getOrderDetails = async (orderId) => {
  const order = await Order.findById(orderId).populate("user", "name email");
  if (!order) throw new Error("Không tìm thấy đơn hàng");
  return order;
};

export const cancelOrderLogic = async (orderId, reason) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Không tìm thấy đơn hàng");

  if (!["processing", "confirmed"].includes(order.orderStatus)) {
    throw new Error("Không thể hủy đơn hàng đang giao");
  }

  order.orderStatus = "cancelled";
  order.cancelReason = reason || "Khách hàng hủy";
  await order.save();

  
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { countInStock: item.quantity }
    });
  }

  return order;
};

export const fetchAllOrdersAdmin = async () => {
  return await Order.find().populate("user", "name email").sort("-createdAt");
};

export const updateStatusLogic = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Không tìm thấy đơn hàng");

  order.orderStatus = status;
  if (status === "delivered") {
    order.paymentStatus = "paid";
    order.deliveredAt = Date.now();
  }
  
  return await order.save();
};