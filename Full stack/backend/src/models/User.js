import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role:     { type: String, enum: ["user", "admin"], default: "user" },
    phone:    { type: String, default: "" },
    address:  {
      street:   { type: String, default: "" },
      ward:     { type: String, default: "" },
      district: { type: String, default: "" },
      city:     { type: String, default: "Hồ Chí Minh" }
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);