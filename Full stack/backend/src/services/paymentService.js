import crypto from "crypto";
import qs from "qs";

export const buildVNPayUrl = (orderCode, amount, orderInfo, ipAddr) => {
  const tmnCode   = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const returnUrl = process.env.VNPAY_RETURN_URL;
  const createDate = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);

  const params = {
    vnp_Version:    "2.1.0",
    vnp_Command:    "pay",
    vnp_TmnCode:    tmnCode,
    vnp_Amount:     amount * 100,
    vnp_CurrCode:   "VND",
    vnp_TxnRef:     orderCode,
    vnp_OrderInfo:  orderInfo,
    vnp_OrderType:  "other",
    vnp_Locale:     "vn",
    vnp_ReturnUrl:  returnUrl,
    vnp_IpAddr:     ipAddr,
    vnp_CreateDate: createDate,
  };

  const sorted   = Object.keys(params).sort().reduce((o, k) => { o[k] = params[k]; return o; }, {});
  const signData = qs.stringify(sorted, { encode: false });
  const hmac     = crypto.createHmac("sha512", secretKey);
  const secureHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return `${process.env.VNPAY_URL}?${signData}&vnp_SecureHash=${secureHash}`;
};

export const verifyVNPayReturn = (query) => {
  const { vnp_SecureHash, ...params } = query;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const sorted    = Object.keys(params).sort().reduce((o, k) => { o[k] = params[k]; return o; }, {});
  const signData  = qs.stringify(sorted, { encode: false });
  const hmac      = crypto.createHmac("sha512", secretKey);
  const checkHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  return checkHash === vnp_SecureHash;
};