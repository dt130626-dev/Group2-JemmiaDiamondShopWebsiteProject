import * as authService from "../services/authService.js";

export const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ message: "User registered successfully", ...result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.json({ message: "Login successful", ...result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await authService.fetchAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await authService.updateUserDetails(req.params.id, req.body);
    res.json({ success: true, user });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await authService.removeUser(req.params.id);
    res.json({ success: true, message: "Đã xóa user" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await authService.getProfileLogic(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await authService.updateProfileLogic(req.user._id, req.body);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};