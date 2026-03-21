const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", default: null },
  variantLabel: { type: String, default: "" },
  name:      { type: String, required: true },
  image:     { type: String },
  category:  { type: String },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type:    String,
      unique:  true,
      default: () => `MHL${Date.now().toString().slice(-6)}`,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    customer: {
      name:  { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    address: {
      line1:   { type: String, required: true },
      line2:   { type: String, default: "" },
      city:    { type: String, required: true },
      pincode: { type: String, required: true },
      state:   { type: String, required: true },
      country: { type: String, default: "India" },
    },
    items:         [orderItemSchema],
    paymentMethod: {
      type:    String,
      enum:    ["cod", "upi", "card"],
      default: "cod",
      required: true,
    },
    paymentStatus: {
      type:    String,
      enum:    ["pending", "paid"],
      default: "pending",
    },
    upiTransactionId: { type: String, default: "" },
    subtotal:      { type: Number, required: true },
    delivery:      { type: Number, default: 0 },
    total:         { type: Number, required: true },
    itemCount:     { type: Number, required: true },

    // ── Order status ──────────────────────────────────────────────
    status:      {
      type:    String,
      enum:    ["pending", "processing", "delivered", "cancelled"],
      default: "pending",
    },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);