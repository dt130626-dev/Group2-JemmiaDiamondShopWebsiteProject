export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    res.status(403);
    throw new Error("Chỉ admin mới có quyền thực hiện");
  }
  next();
};