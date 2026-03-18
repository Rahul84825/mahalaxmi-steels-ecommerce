const mongoose = require("mongoose");

const OFFER_TYPES = ["product", "category", "banner"];

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    discount_percentage: { type: Number, min: 0, max: 100, default: 0 },
    offer_type: { type: String, enum: OFFER_TYPES, default: "banner", required: true },
    linked_product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    linked_category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    theme_color: {
      type: String,
      default: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
      trim: true,
    },
    is_active: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

offerSchema.pre("validate", function (next) {
  if (this.offer_type === "product") {
    if (!this.linked_product_id) {
      return next(new Error("linked_product_id is required for product offer"));
    }
    this.linked_category_id = null;
  }

  if (this.offer_type === "category") {
    if (!this.linked_category_id) {
      return next(new Error("linked_category_id is required for category offer"));
    }
    this.linked_product_id = null;
  }

  if (this.offer_type === "banner") {
    this.linked_product_id = null;
    this.linked_category_id = null;
  }

  return next();
});

// Backward-compatible aliases used by existing frontend code.

offerSchema.virtual("banner_image")
  .get(function () { return this.image; })
  .set(function (value) { this.image = value; });

offerSchema.virtual("discountPercent")
  .get(function () { return this.discount_percentage; })
  .set(function (value) { this.discount_percentage = value; });

offerSchema.virtual("targetProduct")
  .get(function () { return this.linked_product_id; })
  .set(function (value) { this.linked_product_id = value; });

offerSchema.virtual("targetCategory")
  .get(function () { return this.linked_category_id; })
  .set(function (value) { this.linked_category_id = value; });

offerSchema.virtual("linked_category")
  .get(function () { return this.linked_category_id; })
  .set(function (value) { this.linked_category_id = value; });

offerSchema.virtual("offerType")
  .get(function () { return this.offer_type; })
  .set(function (value) { this.offer_type = value; });

offerSchema.virtual("themeColor")
  .get(function () { return this.theme_color; })
  .set(function (value) { this.theme_color = value; });

offerSchema.virtual("bg")
  .get(function () { return this.theme_color; })
  .set(function (value) { this.theme_color = value; });

offerSchema.virtual("accent").get(function () {
  return "";
});

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

module.exports = mongoose.model("Offer", offerSchema);
