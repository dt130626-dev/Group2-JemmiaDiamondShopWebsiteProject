import User from "../models/User.js";

export const fetchWishlist = async (userId) => {
  const user = await User.findById(userId).populate("wishlist");
  if (!user) throw new Error("Người dùng không tồn tại");
  return user.wishlist;
};

export const addProductToWishlist = async (userId, productId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("Người dùng không tồn tại");

 
  if (user.wishlist.includes(productId)) {
    return { alreadyIn: true, wishlist: user.wishlist };
  }

  user.wishlist.push(productId);
  await user.save();
  

  await user.populate("wishlist");
  return { alreadyIn: false, wishlist: user.wishlist };
};

export const removeProductFromWishlist = async (userId, productId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("Người dùng không tồn tại");

 
  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== productId
  );

  await user.save();
  await user.populate("wishlist");
  return user.wishlist;
};