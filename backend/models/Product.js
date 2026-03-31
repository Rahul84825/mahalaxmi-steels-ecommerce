const mongoose = require("mongoose");

const embeddedVariantSchema = new mongoose.Schema(
  {
    id:    { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    originalPrice: { type: Number, required: true, min: 0 },  // List/MRP price
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },  // Discount percentage (max 90%)
    stock: { type: Number, required: true, min: 0, default: 0 },
    // Legacy fields for backward compatibility
    price: { type: Number, min: 0 },  // DEPRECATED
    mrp:   { type: Number, min: 0 },  // DEPRECATED
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    description:   { type: String, default: "" },
    category_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    // REMOVED: Product-level pricing. Use variant pricing instead.
    // price:         { type: Number, required: true, min: 0 },  // ❌ REMOVED
    // originalPrice: { type: Number, min: 0 },                   // ❌ REMOVED
    // mrp:           { type: Number, min: 0 },                   // ❌ REMOVED
    image:         { type: String, default: "" },
    images:        { type: [String], default: [] },
    inStock:       { type: Boolean, default: true },
    brand:         { type: String, default: "" },
    stock:         { type: Number, default: 0 },
    tags:          [{ type: String }],
    variants:      { type: [embeddedVariantSchema], default: [] },
    rating:        { type: Number, default: 0, min: 0, max: 5 },
    reviews:       { type: Number, default: 0 },
    isHero:        { type: Boolean, default: false },
    specifications: { type: Map, of: String },
    has_variants:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Before save: calculate aggregate stock from variants and set inStock flag
productSchema.pre("save", function (next) {
  if (!this.image && Array.isArray(this.images) && this.images.length > 0) {
    this.image = this.images[0];
  }
  if ((!this.images || this.images.length === 0) && this.image) {
    this.images = [this.image];
  }

  this.has_variants = Array.isArray(this.variants) && this.variants.length > 0;
  if (this.has_variants) {
    this.stock = this.variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
    this.inStock = this.stock > 0;
  }

  next();
});

productSchema.virtual("category")
  .get(function () { return this.category_id; })
  .set(function (value) { this.category_id = value; });

// Virtual: Get lowest final price across variants for display/filtering
productSchema.virtual("minFinalPrice").get(function () {
  if (!Array.isArray(this.variants) || this.variants.length === 0) return null;
  
  return Math.min(
    ...this.variants.map((v) => {
      const original = Number(v.originalPrice) || 0;
      const discount = Math.max(0, Math.min(Number(v.discountPercent) || 0, 100));
      return Math.round(original - (original * discount / 100));
    })
  );
});

// Virtual: Get highest original price across variants for display
productSchema.virtual("maxOriginalPrice").get(function () {
  if (!Array.isArray(this.variants) || this.variants.length === 0) return null;
  return Math.max(...this.variants.map((v) => Number(v.originalPrice) || 0));
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);