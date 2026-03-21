const asyncHandler = require("express-async-handler");
const Product      = require("../models/Product");
const Variant      = require("../models/Variant");
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

const normalizeVariantImages = (images) => {
  if (!Array.isArray(images)) return [];
  return images
    .map((img) => (typeof img === "string" ? img.trim() : ""))
    .filter(Boolean);
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

  // Populate variants for each product that has them
  const populated = await Promise.all(
    products.map(async (prod) => {
      if (prod.has_variants) {
        const variants = await Variant.find({ product_id: prod._id }).sort({ createdAt: 1 });
        return { ...prod.toObject(), variants };
      }
      return prod.toObject();
    })
  );

  res.json({ products: populated, total, page: +page, pages: Math.ceil(total / +limit) });
});

// ── GET /api/products/:id ─────────────────────────────────────────────────────
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category_id", "name is_active");
  if (!product) { res.status(404); throw new Error("Product not found"); }
  
  // Load variants if product has them
  let variants = [];
  if (product.has_variants) {
    variants = await Variant.find({ product_id: product._id }).sort({ createdAt: 1 });
  }
  
  res.json({ ...product.toObject(), variants });
});

// ── POST /api/products (admin) ────────────────────────────────────────────────
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, category_id, price, originalPrice, inStock, specifications, has_variants, variants } = req.body;
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
    price: Math.round(+price), originalPrice: Math.round(+originalPrice),
    mrp:    req.body.mrp !== undefined ? Math.round(+req.body.mrp) : Math.round(+originalPrice),
    image:  primaryImage,
    images,
    inStock:  inStock  !== undefined ? inStock  : true,
    brand:    req.body.brand || "",
    stock:    req.body.stock !== undefined ? +req.body.stock : 0,
    tags:     req.body.tags  || [],
    specifications,
    has_variants: !!has_variants,
  });

  // Create variants if has_variants is true
  let createdVariants = [];
  if (has_variants && Array.isArray(variants) && variants.length > 0) {
    createdVariants = await Variant.insertMany(
      variants.map((v) => ({
        product_id: product._id,
        label: v.label || "",
        price: Math.round(+v.price || 0),
        mrp: v.mrp ? Math.round(+v.mrp) : undefined,
        stock: v.stock !== undefined ? +v.stock : 0,
        barcode: v.barcode || "",
        images: normalizeVariantImages(v.images),
      }))
    );
  }

  res.status(201).json({ ...product.toObject(), variants: createdVariants });
});

// ── PUT /api/products/:id (admin) ─────────────────────────────────────────────
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }

  const fields = ["name","description","price","originalPrice","mrp",
                  "image","images","inStock","brand","stock","tags","specifications","has_variants"];
  fields.forEach((f) => { 
    if (req.body[f] !== undefined) {
      // Round price fields to ensure integer values
      if (["price", "originalPrice", "mrp"].includes(f)) {
        product[f] = Math.round(+req.body[f]);
      } else {
        product[f] = req.body[f];
      }
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

  const updated = await product.save();

  // Handle variant updates
  let variants = [];
  if (req.body.variants !== undefined && Array.isArray(req.body.variants)) {
    // Delete existing variants and create new ones
    await Variant.deleteMany({ product_id: updated._id });
    
    if (req.body.variants.length > 0) {
      variants = await Variant.insertMany(
        req.body.variants.map((v) => ({
          product_id: updated._id,
          label: v.label || "",
          price: Math.round(+v.price || 0),
          mrp: v.mrp ? Math.round(+v.mrp) : undefined,
          stock: v.stock !== undefined ? +v.stock : 0,
          barcode: v.barcode || "",
          images: normalizeVariantImages(v.images),
        }))
      );
    }
  } else if (updated.has_variants && !variants.length) {
    // If not updating variants but product has them, fetch existing ones
    variants = await Variant.find({ product_id: updated._id }).sort({ createdAt: 1 });
  }

  const populated = await Product.findById(updated._id).populate("category_id", "name is_active");
  res.json({ ...populated.toObject(), variants });
});

// ── DELETE /api/products/:id (admin) ──────────────────────────────────────────
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }
  
  // Delete associated variants
  await Variant.deleteMany({ product_id: product._id });
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

// ── POST /api/products/:id/variants (admin) ────────────────────────────────────
const createVariant = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }

  const { label, price, mrp, stock, barcode, images } = req.body;
  if (!label || price === undefined) {
    res.status(400);
    throw new Error("label and price are required");
  }

  const variant = await Variant.create({
    product_id: product._id,
    label,
    price: Math.round(+price),
    mrp: mrp ? Math.round(+mrp) : undefined,
    stock: stock !== undefined ? +stock : 0,
    barcode: barcode || "",
    images: normalizeVariantImages(images),
  });

  res.status(201).json(variant);
});

// ── PUT /api/variants/:id (admin) ──────────────────────────────────────────────
const updateVariant = asyncHandler(async (req, res) => {
  const variant = await Variant.findById(req.params.id);
  if (!variant) { res.status(404); throw new Error("Variant not found"); }

  const fields = ["label", "price", "mrp", "stock", "barcode", "images"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      if (f === "price" || f === "mrp") {
        variant[f] = Math.round(+req.body[f]);
      } else if (f === "stock") {
        variant[f] = +req.body[f];
      } else if (f === "images") {
        variant.images = normalizeVariantImages(req.body.images);
      } else {
        variant[f] = req.body[f];
      }
    }
  });

  await variant.save();
  res.json(variant);
});

// ── DELETE /api/variants/:id (admin) ───────────────────────────────────────────
const deleteVariant = asyncHandler(async (req, res) => {
  const variant = await Variant.findById(req.params.id);
  if (!variant) { res.status(404); throw new Error("Variant not found"); }
  
  await variant.deleteOne();
  res.json({ message: "Variant deleted" });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, toggleStock, createVariant, updateVariant, deleteVariant };
