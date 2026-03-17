const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    banner_image: { type: String, default: "" },
    discount_percentage: { type: Number, min: 0, max: 100, default: 0 },
    linked_product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    linked_category: { type: String, default: "", trim: true },
    is_active: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    badge: { type: String, default: "", trim: true },
    bg: { type: String, default: "from-blue-600 to-blue-800" },
    accent: { type: String, default: "bg-blue-500" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Backward-compatible aliases used by existing frontend code.
offerSchema.virtual("image")
  .get(function () { return this.banner_image; })
  .set(function (value) { this.banner_image = value; });

offerSchema.virtual("discountPercent")
  .get(function () { return this.discount_percentage; })
  .set(function (value) { this.discount_percentage = value; });

offerSchema.virtual("targetProduct")
  .get(function () { return this.linked_product_id; })
  .set(function (value) { this.linked_product_id = value; });

offerSchema.virtual("targetCategory")
  .get(function () { return this.linked_category; })
  .set(function (value) { this.linked_category = value; });

offerSchema.virtual("isActive")
  .get(function () { return this.is_active; })
  .set(function (value) { this.is_active = value; });

offerSchema.virtual("active")
  .get(function () { return this.is_active; })
  .set(function (value) { this.is_active = value; });

offerSchema.virtual("discount").get(function () {
  if (!this.discount_percentage) return "";
  return `${this.discount_percentage}% OFF`;
});

offerSchema.virtual("offerType").get(function () {
  if (this.linked_product_id) return "product";
  if (this.linked_category) return "category";
  return "banner";
});

module.exports = mongoose.model("Offer", offerSchema);
