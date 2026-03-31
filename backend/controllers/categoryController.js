const asyncHandler = require("express-async-handler");
const Category     = require("../models/Category");
const Product      = require("../models/Product");

const MAX_FEATURED_CATEGORIES = 4;

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\(|\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeSubcategories = (input) => {
  if (Array.isArray(input)) {
    return input
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  if (typeof input === "string") {
    return input
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const ensureFeaturedCapacity = async ({ nextIsFeatured, currentCategoryId = null }) => {
  if (!nextIsFeatured) return;

  const query = { isFeatured: true };
  if (currentCategoryId) query._id = { $ne: currentCategoryId };

  const featuredCount = await Category.countDocuments(query);
  if (featuredCount >= MAX_FEATURED_CATEGORIES) {
    const err = new Error(`Only ${MAX_FEATURED_CATEGORIES} categories can be featured in navbar`);
    err.statusCode = 400;
    throw err;
  }
};

// GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const onlyFeatured = String(req.query.featured || "").toLowerCase() === "true";
  const onlyActive = String(req.query.active || "").toLowerCase() === "true";
  const limit = Number(req.query.limit || 0);

  const filter = {};
  if (onlyFeatured) filter.isFeatured = true;
  if (onlyActive) filter.is_active = true;

  let query = Category.find(filter).sort({ isFeatured: -1, is_active: -1, created_at: -1 });
  if (Number.isFinite(limit) && limit > 0) {
    query = query.limit(limit);
  }

  const categories = await query;
  res.json(categories);
});

// POST /api/categories (admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, subcategories, isFeatured, image, is_active, label, icon, showInNavbar } = req.body;
  const categoryName = (name || label || "").trim();
  if (!categoryName) { res.status(400); throw new Error("name is required"); }

  const categorySlug = slugify(slug || categoryName);
  const exists = await Category.findOne({ $or: [{ name: categoryName }, { slug: categorySlug }] });
  if (exists) { res.status(400); throw new Error("Category with this name already exists"); }

  const nextIsFeatured = Boolean(isFeatured ?? showInNavbar ?? false);
  await ensureFeaturedCapacity({ nextIsFeatured });

  const category = await Category.create({
    name: categoryName,
    slug: categorySlug,
    subcategories: normalizeSubcategories(subcategories),
    isFeatured: nextIsFeatured,
    image: image || icon || "",
    is_active: is_active !== undefined ? !!is_active : true,
  });
  res.status(201).json(category);
});

// PUT /api/categories/:id (admin)
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) { res.status(404); throw new Error("Category not found"); }

  if (req.body.name !== undefined || req.body.label !== undefined) {
    const nextName = (req.body.name || req.body.label || "").trim() || category.name;
    if (nextName !== category.name) {
      const conflict = await Category.findOne({
        _id: { $ne: category._id },
        name: nextName,
      });
      if (conflict) { res.status(400); throw new Error("Category with this name already exists"); }
    }
    category.name = nextName;
  }
  if (req.body.slug !== undefined) {
    const nextSlug = slugify(req.body.slug || category.name);
    const conflict = await Category.findOne({
      _id: { $ne: category._id },
      slug: nextSlug,
    });
    if (conflict) { res.status(400); throw new Error("Category with this slug already exists"); }
    category.slug = nextSlug;
  }
  if (req.body.subcategories !== undefined) {
    category.subcategories = normalizeSubcategories(req.body.subcategories);
  }
  if (req.body.image !== undefined || req.body.icon !== undefined) {
    category.image = req.body.image || req.body.icon || "";
  }
  if (req.body.isFeatured !== undefined || req.body.showInNavbar !== undefined) {
    const nextIsFeatured = req.body.isFeatured !== undefined ? !!req.body.isFeatured : !!req.body.showInNavbar;
    await ensureFeaturedCapacity({ nextIsFeatured, currentCategoryId: category._id });
    category.isFeatured = nextIsFeatured;
  }
  if (req.body.is_active !== undefined || req.body.isActive !== undefined || req.body.active !== undefined) {
    category.is_active =
      req.body.is_active !== undefined
        ? !!req.body.is_active
        : req.body.isActive !== undefined
          ? !!req.body.isActive
          : !!req.body.active;
  }

  const updated = await category.save();
  res.json(updated);
});

// DELETE /api/categories/:id (admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) { res.status(404); throw new Error("Category not found"); }

  const linkedProducts = await Product.countDocuments({ category_id: category._id });
  if (linkedProducts > 0) {
    res.status(400);
    throw new Error("Cannot delete category linked to products. Reassign products first.");
  }

  await category.deleteOne();
  res.json({ message: "Category deleted" });
});

// PATCH /api/categories/:id/toggle (admin)
const toggleCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) { res.status(404); throw new Error("Category not found"); }

  category.is_active = !category.is_active;
  await category.save();
  res.json({ is_active: category.is_active, isActive: category.is_active, active: category.is_active });
});

// PATCH /api/categories/:id/featured (admin)
const toggleCategoryFeatured = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) { res.status(404); throw new Error("Category not found"); }

  const nextIsFeatured = !category.isFeatured;
  await ensureFeaturedCapacity({ nextIsFeatured, currentCategoryId: category._id });

  category.isFeatured = nextIsFeatured;
  await category.save();
  res.json({ isFeatured: category.isFeatured, showInNavbar: category.isFeatured });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory, toggleCategory, toggleCategoryFeatured };
