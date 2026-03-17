const asyncHandler = require("express-async-handler");
const Product      = require("../models/Product");
const Category     = require("../models/Category");

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
    filter.category_id = category;
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
  const { name, description, category, category_id, price, originalPrice, inStock, isNew, specifications } = req.body;
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
    is_new: req.body.is_new !== undefined ? !!req.body.is_new : isNew !== undefined ? !!isNew : false,
    is_featured:
      req.body.is_featured !== undefined
        ? !!req.body.is_featured
        : req.body.featured !== undefined
          ? !!req.body.featured
          : false,
    is_bestseller:
      req.body.is_bestseller !== undefined
        ? !!req.body.is_bestseller
        : req.body.bestseller !== undefined
          ? !!req.body.bestseller
          : false,
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
                  "image","images","inStock","brand","stock","tags","specifications","is_featured","is_bestseller","is_new"];
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

  if (req.body.featured !== undefined) product.is_featured = !!req.body.featured;
  if (req.body.bestseller !== undefined) product.is_bestseller = !!req.body.bestseller;
  if (req.body.isNew !== undefined) product.is_new = !!req.body.isNew;

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
  res.json({ inStock: product.inStock });
});

// ── PATCH /api/products/:id/featured (admin) ──────────────────────────────────
const toggleFeatured = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }
  product.is_featured = !product.is_featured;
  await product.save();
  res.json({ featured: product.is_featured, is_featured: product.is_featured, _id: product._id });
});

// ── PATCH /api/products/:id/bestseller (admin) ────────────────────────────────
const toggleBestseller = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }
  product.is_bestseller = !product.is_bestseller;
  await product.save();
  res.json({ bestseller: product.is_bestseller, is_bestseller: product.is_bestseller, _id: product._id });
});

// ── PATCH /api/products/:id/isnew (admin) ────────────────────────────────────
const toggleIsNew = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }
  product.is_new = !product.is_new;
  await product.save();
  res.json({ isNew: product.is_new, is_new: product.is_new, _id: product._id });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, toggleStock, toggleFeatured, toggleBestseller, toggleIsNew };
