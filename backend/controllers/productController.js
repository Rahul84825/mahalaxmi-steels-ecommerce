const asyncHandler = require("express-async-handler");
const Product      = require("../models/Product");
const Category     = require("../models/Category");
const mongoose     = require("mongoose");
const { validateDiscountPercent } = require("../utils/priceCalculator");

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

const createVariantId = (index = 0) => `variant_${Date.now().toString(36)}_${index.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeVariantsInput = (rawVariants, { required = false } = {}) => {
  if (!Array.isArray(rawVariants)) {
    if (required) {
      const err = new Error("At least one variant is required");
      err.statusCode = 400;
      throw err;
    }
    return [];
  }

  const normalized = rawVariants.map((variant, index) => {
    const id = String(variant?.id || variant?._id || createVariantId(index)).trim();
    const label = String(variant?.label || "").trim();
    
    // NEW: Use originalPrice and discountPercent
    const originalPrice = Number(variant?.originalPrice ?? variant?.price ?? variant?.mrp);
    const discountPercent = Number(variant?.discountPercent ?? 0);
    const stock = Number(variant?.stock);

    if (!label) {
      const err = new Error(`Variant #${index + 1}: label is required`);
      err.statusCode = 400;
      throw err;
    }

    if (!Number.isFinite(originalPrice) || originalPrice <= 0) {
      const err = new Error(`Variant #${index + 1}: originalPrice must be a positive number`);
      err.statusCode = 400;
      throw err;
    }

    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 90) {
      const err = new Error(`Variant #${index + 1}: discountPercent must be between 0 and 90`);
      err.statusCode = 400;
      throw err;
    }

    if (!Number.isFinite(stock) || stock < 0) {
      const err = new Error(`Variant #${index + 1}: stock must be 0 or greater`);
      err.statusCode = 400;
      throw err;
    }

    return {
      id,
      label,
      originalPrice: Math.round(originalPrice),
      discountPercent: Math.round(discountPercent * 100) / 100,  // Allow decimals
      stock: Math.floor(stock),
    };
  });

  if (required && normalized.length === 0) {
    const err = new Error("At least one variant is required");
    err.statusCode = 400;
    throw err;
  }

  const seenIds = new Set();
  for (const variant of normalized) {
    if (seenIds.has(variant.id)) {
      const err = new Error("Duplicate variant id detected");
      err.statusCode = 400;
      throw err;
    }
    seenIds.add(variant.id);
  }

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
    "newest":     { createdAt: -1 },
    "default":    { createdAt: -1 },
  };
  const sort = sortMap[sortBy] || sortMap["default"];

  const total    = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("category_id", "name is_active")
    .sort(sort)
    .skip((+page - 1) * +limit)
    .limit(+limit);

  res.json({ products, total, page: +page, pages: Math.ceil(total / +limit) });
});

// ── GET /api/products/:id ─────────────────────────────────────────────────────
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category_id", "name is_active");
  if (!product) { res.status(404); throw new Error("Product not found"); }
  
  res.json(product);
});

// ── POST /api/products (admin) ────────────────────────────────────────────────
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, category_id, inStock, specifications, isHero } = req.body;
  const resolvedCategoryId = category_id || category;

  if (!name || !resolvedCategoryId) {
    res.status(400);
    throw new Error("Please provide name and category_id");
  }

  const exists = await Category.findById(resolvedCategoryId);
  if (!exists) {
    res.status(400);
    throw new Error("Invalid category_id");
  }

  // Variants are now required for pricing
  const variants = normalizeVariantsInput(req.body.variants, { required: true });
  const images = normalizeImageArray(req.body.images, req.body.image);
  const primaryImage = images[0] || "";
  const derivedStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
  const derivedInStock = derivedStock > 0;

  const product = await Product.create({
    name,
    description,
    category_id: resolvedCategoryId,
    // NO LONGER setting product-level price fields
    image:  primaryImage,
    images,
    inStock:  inStock !== undefined ? !!inStock : derivedInStock,
    brand:    req.body.brand || "",
    variants,
    has_variants: true,  // Always true with new schema
    isHero:   !!isHero,
    tags:     req.body.tags || [],
    specifications,
  });

  if (product.isHero) {
    await Product.updateMany(
      { _id: { $ne: product._id }, isHero: true },
      { $set: { isHero: false } }
    );
  }

  res.status(201).json(product);
});

// ── PUT /api/products/:id (admin) ─────────────────────────────────────────────
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }

  // Updated fields list: removed product-level price fields
  const fields = ["name", "description", "image", "images", "inStock", "brand", "tags", "specifications", "isHero"];
  fields.forEach((f) => { 
    if (req.body[f] !== undefined) {
      product[f] = req.body[f];
    }
  });

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

  if (req.body.variants !== undefined) {
    const normalizedVariants = normalizeVariantsInput(req.body.variants, { required: true });
    product.variants = normalizedVariants;
    product.has_variants = true;  // Always true now

    // Keep product stock in sync with variant stock totals when variants are provided.
    product.stock = normalizedVariants.reduce((sum, variant) => sum + variant.stock, 0);
    product.inStock = product.stock > 0;
  }

  const updated = await product.save();

  if (updated.isHero) {
    await Product.updateMany(
      { _id: { $ne: updated._id }, isHero: true },
      { $set: { isHero: false } }
    );
  }

  const populated = await Product.findById(updated._id).populate("category_id", "name is_active");
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

// ── PATCH /api/products/:id/set-hero (admin) ─────────────────────────────────
const setHeroProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }

  await Product.updateMany({}, { $set: { isHero: false } });
  product.isHero = true;
  await product.save();

  const populated = await Product.findById(product._id).populate("category_id", "name is_active");
  res.json({ product: populated, message: "Hero product updated" });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, toggleStock, setHeroProduct };
