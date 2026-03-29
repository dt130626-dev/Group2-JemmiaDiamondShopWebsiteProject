import asyncHandler from "express-async-handler";
import crypto from "crypto";
import qs from "qs";
import Order from "../models/Order.js";

function createVNPayUrl(orderId, amount, orderInfo, ipAddr) {
  const tmnCode   = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const returnUrl = process.env.VNPAY_RETURN_URL;

  const date    = new Date();
  const createDate = date.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);

  const params = {
    vnp_Version:    "2.1.0",
    vnp_Command:    "pay",
    vnp_TmnCode:    tmnCode,
    vnp_Amount:     amount * 100,        
    vnp_CurrCode:   "VND",
    vnp_TxnRef:     orderId,
    vnp_OrderInfo:  orderInfo,
    vnp_OrderType:  "other",
    vnp_Locale:     "vn",
    vnp_ReturnUrl:  returnUrl,
    vnp_IpAddr:     ipAddr,
    vnp_CreateDate: createDate,
  };

  
  const sorted    = Object.keys(params).sort().reduce((obj, k) => { obj[k] = params[k]; return obj; }, {});
  const signData  = qs.stringify(sorted, { encode: false });
  const hmac      = crypto.createHmac("sha512", secretKey);
  const signature = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return `${process.env.VNPAY_URL}?${signData}&vnp_SecureHash=${signature}`;
}


export const createVNPayPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  if (!order) { res.status(404); throw new Error("Không tìm thấy đơn hàng"); }
  if (order.paymentStatus === "paid") { res.status(400); throw new Error("Đơn hàng đã được thanh toán"); }

  const ipAddr  = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const payUrl  = createVNPayUrl(order.orderCode, order.totalPrice, `Thanh toan ${order.orderCode}`, ipAddr);

  res.json({ success: true, payUrl });
});


export const vnpayReturn = asyncHandler(async (req, res) => {
  const { vnp_ResponseCode, vnp_TxnRef, vnp_TransactionNo, vnp_SecureHash, ...rest } = req.query;

 
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const sorted    = Object.keys(rest).sort().reduce((obj, k) => { obj[k] = rest[k]; return obj; }, {});
  sorted["vnp_ResponseCode"] = vnp_ResponseCode;
  sorted["vnp_TxnRef"]       = vnp_TxnRef;
  sorted["vnp_TransactionNo"] = vnp_TransactionNo;
  const signData  = qs.stringify(Object.keys(sorted).sort().reduce((o, k) => { o[k] = sorted[k]; return o; }, {}), { encode: false });
  const hmac      = crypto.createHmac("sha512", secretKey);
  const checkHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (checkHash !== vnp_SecureHash) {
    return res.redirect(`${process.env.CLIENT_URL}/payment/failed?reason=invalid_signature`);
  }

  const order = await Order.findOne({ orderCode: vnp_TxnRef });
  if (!order) return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);

  if (vnp_ResponseCode === "00") {
    order.paymentStatus          = "paid";
    order.paymentResult          = { transactionId: vnp_TransactionNo, status: "paid", paidAt: new Date() };
    await order.save();
    return res.redirect(`${process.env.CLIENT_URL}/payment/success?orderId=${order._id}`);
  }

  res.redirect(`${process.env.CLIENT_URL}/payment/failed?orderId=${order._id}`);
});