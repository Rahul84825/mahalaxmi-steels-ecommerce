const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

brandSchema.virtual("showInNavbar")
  .get(function () { return this.isFeatured; })
  .set(function (value) { this.isFeatured = !!value; });

module.exports = mongoose.model("Brand", brandSchema);
