import express from "express";
import { register, login, getAllUsers, updateUser, deleteUser, createUser ,getUserProfile,updateUserProfile} from "../controllers/authController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Admin only
router.get("/users", protect, adminOnly, getAllUsers);
router.post("/users", protect, adminOnly, createUser);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
export default router;