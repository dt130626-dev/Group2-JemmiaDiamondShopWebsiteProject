import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name:     String,
        image:    String,
        price:    Number,
        quantity: Number,
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone:    { type: String, required: true },
      address:  { type: String, required: true },
    },
    totalPrice:    { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cod", "vnpay"], default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    orderStatus: {
  type: String,
  enum: ["processing", "confirmed", "shipping", "delivered", "cancelled"],
  default: "processing",
},
    isPaid:      { type: Boolean, default: false },
    isDelivered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);