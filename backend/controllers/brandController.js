const asyncHandler = require("express-async-handler");
const Brand = require("../models/Brand");

// GET /api/brands
const getBrands = asyncHandler(async (req, res) => {
  const onlyFeatured = String(req.query.featured || "").toLowerCase() === "true";
  const filter = onlyFeatured ? { isFeatured: true } : {};
  const brands = await Brand.find(filter).sort({ isFeatured: -1, name: 1 });
  res.json(brands);
});

// POST /api/brands (admin)
const createBrand = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name) {
    res.status(400);
    throw new Error("name is required");
  }

  const exists = await Brand.findOne({ name });
  if (exists) {
    res.status(400);
    throw new Error("Brand with this name already exists");
  }

  const brand = await Brand.create({
    name,
    isFeatured: !!(req.body.isFeatured ?? req.body.showInNavbar ?? false),
  });

  res.status(201).json(brand);
});

// PUT /api/brands/:id (admin)
const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    res.status(404);
    throw new Error("Brand not found");
  }

  if (req.body.name !== undefined) {
    const nextName = String(req.body.name || "").trim();
    if (!nextName) {
      res.status(400);
      throw new Error("name is required");
    }

    const conflict = await Brand.findOne({ _id: { $ne: brand._id }, name: nextName });
    if (conflict) {
      res.status(400);
      throw new Error("Brand with this name already exists");
    }

    brand.name = nextName;
  }

  if (req.body.isFeatured !== undefined || req.body.showInNavbar !== undefined) {
    brand.isFeatured = req.body.isFeatured !== undefined
      ? !!req.body.isFeatured
      : !!req.body.showInNavbar;
  }

  const updated = await brand.save();
  res.json(updated);
});

// DELETE /api/brands/:id (admin)
const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    res.status(404);
    throw new Error("Brand not found");
  }

  await brand.deleteOne();
  res.json({ message: "Brand deleted" });
});

// PATCH /api/brands/:id/featured (admin)
const toggleBrandFeatured = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    res.status(404);
    throw new Error("Brand not found");
  }

  brand.isFeatured = !brand.isFeatured;
  await brand.save();
  res.json({ isFeatured: brand.isFeatured, showInNavbar: brand.isFeatured });
});

module.exports = {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandFeatured,
};
