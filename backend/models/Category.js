const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    image:     { type: String, default: "" },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

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

module.exports = mongoose.model("Category", categorySchema);
