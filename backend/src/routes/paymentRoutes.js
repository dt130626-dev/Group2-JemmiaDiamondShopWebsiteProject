import express from "express";
import { createVNPayPayment, vnpayReturn } from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";
 
const router = express.Router();
 
router.post("/vnpay-create", protect, createVNPayPayment);
router.get("/vnpay-return",  vnpayReturn);
 
export default router