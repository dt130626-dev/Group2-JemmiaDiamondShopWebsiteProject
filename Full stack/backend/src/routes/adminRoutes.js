import express from "express";
import { getDashboardStats, getAllUsers, deleteUser } from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/roleMiddleware.js";

const router = express.Router();
router.use(protect, adminOnly);

router.get("/stats",        getDashboardStats);
router.get("/users",        getAllUsers);
router.delete("/users/:id", deleteUser);

export default router;