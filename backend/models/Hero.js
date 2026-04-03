const mongoose = require("mongoose");

const heroImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    public_id: { type: String, required: true, trim: true },
  },
  { _id: true }
);

const heroSchema = new mongoose.Schema(
  {
    images: {
      type: [heroImageSchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Hero", heroSchema);
