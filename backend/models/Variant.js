const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    label:      { type: String, required: true, trim: true },  // e.g., "1L", "3L", "Small", "Medium"
    price:      { type: Number, required: true, min: 0 },
    mrp:        { type: Number, min: 0 },  // optional original price for variant
    stock:      { type: Number, default: 0, min: 0 },
    barcode:    { type: String, default: "" },  // optional barcode for variant
    images:     [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Index for faster lookups by product_id
variantSchema.index({ product_id: 1 });

module.exports = mongoose.model("Variant", variantSchema);
