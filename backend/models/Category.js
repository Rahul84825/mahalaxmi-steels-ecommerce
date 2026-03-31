const mongoose = require("mongoose");

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\(|\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const categorySchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    slug:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    subcategories: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.every((item) => String(item || "").trim().length > 0),
        message: "Subcategories must be non-empty strings",
      },
    },
    isFeatured: { type: Boolean, default: false },
    image:     { type: String, default: "" },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.pre("validate", function (next) {
  if (!this.slug || !String(this.slug).trim()) {
    this.slug = slugify(this.name);
  } else {
    this.slug = slugify(this.slug);
  }
  next();
});

// Backward-compatible aliases used by existing frontend code.
categorySchema.virtual("label")
  .get(function () { return this.name; })
  .set(function (value) { this.name = value; });

categorySchema.virtual("icon")
  .get(function () { return this.image; })
  .set(function (value) { this.image = value; });

categorySchema.virtual("isActive")
  .get(function () { return this.is_active; })
  .set(function (value) { this.is_active = !!value; });

categorySchema.virtual("showInNavbar")
  .get(function () { return this.isFeatured; })
  .set(function (value) { this.isFeatured = !!value; });

module.exports = mongoose.model("Category", categorySchema);
