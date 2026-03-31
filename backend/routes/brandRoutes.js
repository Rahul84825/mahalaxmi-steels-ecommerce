const express = require("express");
const router = express.Router();
const {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandFeatured,
} = require("../controllers/brandController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

router.get("/", getBrands);
router.post("/", protect, isAdmin, createBrand);
router.put("/:id", protect, isAdmin, updateBrand);
router.delete("/:id", protect, isAdmin, deleteBrand);
router.patch("/:id/featured", protect, isAdmin, toggleBrandFeatured);

module.exports = router;
