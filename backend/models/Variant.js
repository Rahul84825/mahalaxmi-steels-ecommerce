const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    label:      { type: String, required: true, trim: true },  // e.g., "1L", "3L", "Small", "Medium"
    originalPrice: { type: Number, required: true, min: 0 },  // List/MRP price
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },  // Discount percentage (max 90%)
    stock:      { type: Number, default: 0, min: 0 },
    barcode:    { type: String, default: "" },  // optional barcode for variant
    images:     [{ type: String, trim: true }],
    // Legacy fields for backward compatibility (will be migrated)
    price:      { type: Number, min: 0 },  // DEPRECATED: use finalPrice calculation
    mrp:        { type: Number, min: 0 },  // DEPRECATED: use originalPrice
  },
  { timestamps: true }
);

// Index for faster lookups by product_id
variantSchema.index({ product_id: 1 });

// Virtual: Calculate final price based on original price and discount
variantSchema.virtual("finalPrice").get(function () {
  const original = Number(this.originalPrice) || 0;
  const discount = Math.max(0, Math.min(Number(this.discountPercent) || 0, 100));
  return Math.round(original - (original * discount / 100));
});

// Include virtuals when converting to JSON
variantSchema.set("toJSON", { virtuals: true });
variantSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Variant", variantSchema);
