const asyncHandler = require("express-async-handler");
const Product      = require("../models/Product");
const Category     = require("../models/Category");
const mongoose     = require("mongoose");

const normalizeCategoryToken = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\(|\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const resolveCategoryIdFromQuery = async (categoryQuery) => {
  const raw = String(categoryQuery || "").trim();
  if (!raw || raw.toLowerCase() === "all" || raw.toLowerCase() === "[object object]") {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(raw)) {
    const existingById = await Category.findById(raw).select("_id");
    if (existingById) return existingById._id;
  }

  const token = normalizeCategoryToken(raw);
  if (!token) return null;

  const categories = await Category.find({}).select("_id name");
  const matched = categories.find((cat) => normalizeCategoryToken(cat.name) === token);

  return matched?._id || null;
};

const normalizeImageArray = (images, image) => {
  const base = Array.isArray(images) ? images : [];
  const normalized = base
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  const primary = typeof image === "string" ? image.trim() : "";
  if (primary && !normalized.includes(primary)) normalized.unshift(primary);
  return normalized;
};

// ── GET /api/products ─────────────────────────────────────────────────────────
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, sortBy, inStockOnly, page = 1, limit = 50 } = req.query;

  const filter = {};
  if (category && category !== "all") {
    const resolvedCategoryId = await resolveCategoryIdFromQuery(category);
    if (resolvedCategoryId) {
      filter.category_id = resolvedCategoryId;
    }
  }
  if (inStockOnly === "true")         filter.inStock   = true;
  if (search) {
    filter.$or = [
      { name:        { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const sortMap = {
    "price-low":  { price: 1 },
    "price-high": { price: -1 },
    "rating":     { rating: -1 },
    "newest":     { createdAt: -1 },
    "default":    { createdAt: -1 },
  };
  const sort = sortMap[sortBy] || sortMap["default"];

  const total    = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("category_id", "name image is_active")
    .sort(sort)
    .skip((+page - 1) * +limit)
    .limit(+limit);

  res.json({ products, total, page: +page, pages: Math.ceil(total / +limit) });
});

// ── GET /api/products/:id ─────────────────────────────────────────────────────
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category_id", "name image is_active");
  if (!product) { res.status(404); throw new Error("Product not found"); }
  res.json(product);
});

// ── POST /api/products (admin) ────────────────────────────────────────────────
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, category_id, price, originalPrice, inStock, specifications } = req.body;
  const resolvedCategoryId = category_id || category;

  if (!name || !resolvedCategoryId || !price || !originalPrice) {
    res.status(400);
    throw new Error("Please provide name, category_id, price and originalPrice");
  }

  const exists = await Category.findById(resolvedCategoryId);
  if (!exists) {
    res.status(400);
    throw new Error("Invalid category_id");
  }

  const images = normalizeImageArray(req.body.images, req.body.image);
  const primaryImage = images[0] || "";

  const product = await Product.create({
    name,
    description,
    category_id: resolvedCategoryId,
    price: +price, originalPrice: +originalPrice,
    mrp:    req.body.mrp    !== undefined ? +req.body.mrp : +originalPrice,
    image:  primaryImage,
    images,
    inStock:  inStock  !== undefined ? inStock  : true,
    brand:    req.body.brand || "",
    stock:    req.body.stock !== undefined ? +req.body.stock : 0,
    tags:     req.body.tags  || [],
    specifications,
  });

  res.status(201).json(product);
});

// ── PUT /api/products/:id (admin) ─────────────────────────────────────────────
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }

  const fields = ["name","description","price","originalPrice","mrp",
                  "image","images","inStock","brand","stock","tags","specifications"];
  fields.forEach((f) => { if (req.body[f] !== undefined) product[f] = req.body[f]; });

  if (req.body.category_id !== undefined || req.body.category !== undefined) {
    const nextCategoryId = req.body.category_id || req.body.category;
    const exists = await Category.findById(nextCategoryId);
    if (!exists) {
      res.status(400);
      throw new Error("Invalid category_id");
    }
    product.category_id = nextCategoryId;
  }

  if (req.body.image !== undefined || req.body.images !== undefined) {
    const normalizedImages = normalizeImageArray(
      req.body.images !== undefined ? req.body.images : product.images,
      req.body.image !== undefined ? req.body.image : product.image
    );
    product.images = normalizedImages;
    product.image = normalizedImages[0] || "";
  }

  const updated = await product.save();
  const populated = await Product.findById(updated._id).populate("category_id", "name image is_active");
  res.json(populated);
});

// ── DELETE /api/products/:id (admin) ──────────────────────────────────────────
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }
  await product.deleteOne();
  res.json({ message: "Product deleted" });
});

// ── PATCH /api/products/:id/stock (admin) ─────────────────────────────────────
const toggleStock = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }
  product.inStock = !product.inStock;
  await product.save();
  res.json({ product: { _id: product._id, inStock: product.inStock } });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, toggleStock };
