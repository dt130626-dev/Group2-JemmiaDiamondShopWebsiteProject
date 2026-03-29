import express from "express";
import { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const orderRouter = express.Router();
orderRouter.use(protect);

orderRouter.post("/",             createOrder);
orderRouter.get("/my",            getMyOrders);      
orderRouter.get("/:id",           getOrderById);
orderRouter.put("/:id/cancel",    cancelOrder);
orderRouter.get("/admin/all",     adminOnly, getAllOrders);
orderRouter.put("/:id/status",    adminOnly, updateOrderStatus);

export default orderRouter;