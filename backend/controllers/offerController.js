const asyncHandler = require("express-async-handler");
const Offer        = require("../models/Offer");
const mongoose     = require("mongoose");

const DEFAULT_THEME_COLOR = "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)";

const LEGACY_THEME_MAP = {
  blue: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
  slate: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
  emerald: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
  orange: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
  rose: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
  "from-blue-600 to-blue-800": "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
  "from-slate-700 to-slate-900": "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
  "from-emerald-500 to-emerald-700": "linear-gradient(135deg, #10b981 0%, #047857 100%)",
  "from-orange-500 to-orange-700": "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
  "from-rose-500 to-rose-700": "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
};

const normalizeOfferType = (value) => {
  const type = String(value || "").trim().toLowerCase();
  if (type === "product" || type === "category" || type === "banner") return type;
  return null;
};

const normalizeThemeColor = (value) => {
  if (typeof value !== "string") return DEFAULT_THEME_COLOR;
  const raw = value.trim();
  if (!raw) return DEFAULT_THEME_COLOR;
  if (LEGACY_THEME_MAP[raw]) return LEGACY_THEME_MAP[raw];

  if (
    raw.startsWith("linear-gradient") ||
    raw.startsWith("radial-gradient") ||
    raw.startsWith("#") ||
    raw.startsWith("rgb") ||
    raw.startsWith("hsl")
  ) {
    return raw;
  }

  return DEFAULT_THEME_COLOR;
};

const normalizeOptionalObjectId = (value, fieldName) => {
  if (value === undefined || value === null) return null;

  let raw = value;
  if (typeof value === "object") {
    raw = value._id || value.id || null;
  }

  const normalized = String(raw || "").trim();
  if (!normalized || normalized.toLowerCase() === "null" || normalized.toLowerCase() === "none") {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(normalized)) {
    const err = new Error(`Invalid ${fieldName}`);
    err.statusCode = 400;
    throw err;
  }
  return normalized;
};

const inferOfferType = (body = {}) => {
  const explicit = normalizeOfferType(body.offer_type ?? body.offerType);
  if (explicit) return explicit;

  const productValue = body.linked_product_id ?? body.targetProduct;
  const categoryValue = body.linked_category_id ?? body.targetCategory ?? body.category;

  if (productValue) return "product";
  if (categoryValue) return "category";
  return "banner";
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const clampDiscount = (value) => {
  const discount = toNumber(value, 0);
  if (discount < 0) return 0;
  if (discount > 100) return 100;
  return discount;
};

const buildOfferPayload = (body = {}, { requireTitle = false } = {}) => {
  const offerType = inferOfferType(body);
  const linkedProductId = normalizeOptionalObjectId(
    body.linked_product_id ?? body.targetProduct,
    "linked_product_id"
  );
  const linkedCategoryId = normalizeOptionalObjectId(
    body.linked_category_id ?? body.targetCategory ?? body.category,
    "linked_category_id"
  );

  if (requireTitle && !(body.title || "").trim()) {
    const err = new Error("title is required");
    err.statusCode = 400;
    throw err;
  }

  if ((body.title || "").trim().length > 0 && (body.title || "").trim().length < 4) {
    const err = new Error("title must be at least 4 characters");
    err.statusCode = 400;
    throw err;
  }

  if (offerType === "product" && !linkedProductId) {
    const err = new Error("Invalid linked_product_id");
    err.statusCode = 400;
    throw err;
  }

  if (offerType === "category" && !linkedCategoryId) {
    const err = new Error("Invalid linked_category_id");
    err.statusCode = 400;
    throw err;
  }

  return {
    title: (body.title || "").trim(),
    description: body.description ?? body.subtitle ?? "",
    image: body.image ?? body.banner_image ?? "",
    discount_percentage: clampDiscount(body.discount_percentage ?? body.discountPercent ?? body.discount),
    offer_type: offerType,
    linked_product_id: offerType === "product" ? linkedProductId : null,
    linked_category_id: offerType === "category" ? linkedCategoryId : null,
    theme_color: normalizeThemeColor(body.theme_color ?? body.themeColor ?? body.bg),
    priority: toNumber(body.priority, 0),
    is_active:
      body.is_active !== undefined
        ? !!body.is_active
        : body.isActive !== undefined
          ? !!body.isActive
          : body.active !== undefined
            ? !!body.active
            : true,
  };
};

const getOffers    = asyncHandler(async (req, res) => {
  const offers = await Offer.find()
    .sort({ is_active: -1, priority: -1, created_at: -1 })
    .populate("linked_product_id", "name image images price mrp category")
    .populate("linked_category_id", "name image");
  res.json(offers);
});

const createOffer  = asyncHandler(async (req, res) => {
  const payload = buildOfferPayload(req.body, { requireTitle: true });
  const offer = await Offer.create(payload);
  const populated = await Offer.findById(offer._id)
    .populate("linked_product_id", "name image images price mrp category")
    .populate("linked_category_id", "name image");
  res.status(201).json({ offer: populated });
});

const updateOffer  = asyncHandler(async (req, res) => {
  const existing = await Offer.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error("Offer not found");
  }

  const mergedInput = {
    title: req.body.title ?? existing.title,
    description: req.body.description ?? req.body.subtitle ?? existing.description,
    image: req.body.image ?? req.body.banner_image ?? existing.image,
    discount_percentage:
      req.body.discount_percentage ?? req.body.discountPercent ?? req.body.discount ?? existing.discount_percentage,
    offer_type: req.body.offer_type ?? req.body.offerType ?? existing.offer_type,
    linked_product_id: req.body.linked_product_id ?? req.body.targetProduct ?? existing.linked_product_id,
    linked_category_id:
      req.body.linked_category_id ?? req.body.targetCategory ?? req.body.category ?? existing.linked_category_id,
    theme_color: req.body.theme_color ?? req.body.themeColor ?? req.body.bg ?? existing.theme_color,
    priority: req.body.priority ?? existing.priority,
    is_active: req.body.is_active ?? req.body.isActive ?? req.body.active ?? existing.is_active,
  };

  const updates = buildOfferPayload(mergedInput, { requireTitle: true });
  const updated = await Offer.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updated) {
    res.status(404);
    throw new Error("Offer not found");
  }

  const populated = await Offer.findById(updated._id)
    .populate("linked_product_id", "name image images price mrp category")
    .populate("linked_category_id", "name image");
  console.log(`[offers] updated offer ${updated._id}`);
  res.json({ offer: populated });
});

const deleteOffer  = asyncHandler(async (req, res) => {
  const deleted = await Offer.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("Offer not found");
  }
  console.log(`[offers] deleted offer ${deleted._id}`);
  res.json({ message: "Offer deleted", deletedId: deleted._id });
});

const toggleOffer  = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) { res.status(404); throw new Error("Offer not found"); }
  const updated = await Offer.findByIdAndUpdate(
    req.params.id,
    { $set: { is_active: !offer.is_active } },
    { new: true }
  );
  res.json({
    offer: updated,
    active: updated.is_active,
    isActive: updated.is_active,
    is_active: updated.is_active,
  });
});

module.exports = { getOffers, createOffer, updateOffer, deleteOffer, toggleOffer };
