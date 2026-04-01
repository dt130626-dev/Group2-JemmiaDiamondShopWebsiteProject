import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already exists");

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashedPassword, role });

  return {
    token: generateToken(user),
    name: user.name,
    email: user.email
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return {
    token: generateToken(user),
    name: user.name,
    email: user.email,
    role: user.role
  };
};

export const fetchAllUsers = async () => {
  return await User.find().select("-password").sort("-createdAt");
};

export const updateUserDetails = async (id, updateData) => {
  const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};

export const removeUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error("User not found");
  return true;
};

export const getProfileLogic = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    address: {
      street: user.address?.street || "",
      ward: user.address?.ward || "",
      district: user.address?.district || "",
      city: user.address?.city || "Hồ Chí Minh"
    }
  };
};

export const updateProfileLogic = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.name = updateData.name || user.name;
  user.phone = updateData.phone || user.phone;
  user.address = {
    street: updateData.address?.street || user.address?.street || "",
    ward: updateData.address?.ward || user.address?.ward || "",
    district: updateData.address?.district || user.address?.district || "",
    city: updateData.address?.city || user.address?.city || "Hồ Chí Minh"
  };

  if (updateData.password) {
    user.password = await bcrypt.hash(updateData.password, 12);
  }

  const updatedUser = await user.save();
  return {
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    address: updatedUser.address
  };
};