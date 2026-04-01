import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
const token = req.headers.authorization?.split(" ")[1];
if (!token)
return res.status(401).json({ message: "Not authorized" });
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const user = await User.findById(decoded.id);
if (!user)
return res.status(401).json({ message: "User no longer exists" });
req.user = user;
next();
} catch (error) {
res.status(401).json({ message: "Token invalid" });
}
};
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    res.status(403);
    throw new Error("Chỉ admin mới có quyền thực hiện");
  }
  next();
};