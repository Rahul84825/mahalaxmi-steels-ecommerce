const asyncHandler = require("express-async-handler");
const Category     = require("../models/Category");
const Product      = require("../models/Product");

// GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ is_active: -1, created_at: -1 });
  res.json(categories);
});

// POST /api/categories (admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, image, is_active, label, icon } = req.body;
  const categoryName = (name || label || "").trim();
  if (!categoryName) { res.status(400); throw new Error("name is required"); }

  const exists = await Category.findOne({ name: categoryName });
  if (exists) { res.status(400); throw new Error("Category with this name already exists"); }

  const category = await Category.create({
    name: categoryName,
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
    category.name = (req.body.name || req.body.label || "").trim() || category.name;
  }
  if (req.body.image !== undefined || req.body.icon !== undefined) {
    category.image = req.body.image || req.body.icon || "";
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

module.exports = { getCategories, createCategory, updateCategory, deleteCategory, toggleCategory };
