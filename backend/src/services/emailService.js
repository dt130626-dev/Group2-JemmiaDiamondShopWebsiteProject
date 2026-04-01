import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOrderConfirmEmail = async (toEmail, order) => {
  const itemsHtml = order.items
    .map((i) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${i.price.toLocaleString("vi-VN")}đ</td></tr>`)
    .join("");

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      toEmail,
    subject: `Xác nhận đơn hàng #${order.orderCode}`,
    html: `
      <h2>Cảm ơn bạn đã đặt hàng!</h2>
      <p>Mã đơn hàng: <strong>${order.orderCode}</strong></p>
      <table border="1" cellpadding="8">
        <tr><th>Sản phẩm</th><th>SL</th><th>Giá</th></tr>
        ${itemsHtml}
      </table>
      <p>Tổng tiền: <strong>${order.totalPrice.toLocaleString("vi-VN")}đ</strong></p>
    `,
  });
};