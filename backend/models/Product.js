const mongoose = require("mongoose");

const embeddedVariantSchema = new mongoose.Schema(
  {
    id:    { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    description:   { type: String, default: "" },
    category_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    price:         { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },   // kept for backward compat
    mrp:           { type: Number, min: 0 },   // alias — form sends this
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
    has_variants:  { type: Boolean, default: false },  // NEW: whether product has variants
  },
  { timestamps: true }
);

// Before save: keep mrp and originalPrice in sync
productSchema.pre("save", function (next) {
  if (this.mrp && !this.originalPrice) this.originalPrice = this.mrp;
  if (this.originalPrice && !this.mrp) this.mrp = this.originalPrice;
  if (!this.image && Array.isArray(this.images) && this.images.length > 0) {
    this.image = this.images[0];
  }
  if ((!this.images || this.images.length === 0) && this.image) {
    this.images = [this.image];
  }

  this.has_variants = Array.isArray(this.variants) && this.variants.length > 0;
  if (this.has_variants) {
    this.stock = this.variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
  }

  next();
});

productSchema.virtual("category")
  .get(function () { return this.category_id; })
  .set(function (value) { this.category_id = value; });

// Virtual: discount percentage
productSchema.virtual("discount").get(function () {
  const base = this.mrp || this.originalPrice;
  if (!base || base <= this.price) return 0;
  return Math.round(((base - this.price) / base) * 100);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);