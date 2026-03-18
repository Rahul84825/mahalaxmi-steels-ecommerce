const asyncHandler = require("express-async-handler");
const Offer        = require("../models/Offer");
const mongoose     = require("mongoose");

const normalizeOptionalObjectId = (value) => {
  if (value === undefined || value === null) return undefined;
  const normalized = String(value).trim();
  if (!normalized || normalized.toLowerCase() === "null" || normalized.toLowerCase() === "none") {
    return undefined;
  }
  if (!mongoose.Types.ObjectId.isValid(normalized)) {
    const err = new Error("Invalid linked_product_id");
    err.statusCode = 400;
    throw err;
  }
  return normalized;
};

const normalizeOfferPayload = (body = {}) => {
  const linkedCategory = body.linked_category ?? body.targetCategory ?? body.category ?? "";
  const discountPercentage = Number(
    body.discount_percentage ?? body.discountPercent ?? body.discount ?? 0
  );

  return {
    title: body.title,
    description: body.description ?? body.subtitle ?? "",
    banner_image: body.banner_image ?? body.image ?? "",
    discount_percentage: Number.isNaN(discountPercentage) ? 0 : discountPercentage,
    linked_product_id: normalizeOptionalObjectId(body.linked_product_id ?? body.targetProduct),
    linked_category: linkedCategory,
    is_active:
      body.is_active !== undefined
        ? !!body.is_active
        : body.isActive !== undefined
          ? !!body.isActive
          : body.active !== undefined
            ? !!body.active
            : true,
    priority: Number(body.priority ?? 0),
    badge: body.badge ?? "",
    bg: body.bg,
    accent: body.accent,
  };
};

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const buildOfferUpdatePayload = (body = {}) => {
  const updates = {};

  if (hasOwn(body, "title")) updates.title = body.title;
  if (hasOwn(body, "description") || hasOwn(body, "subtitle")) {
    updates.description = body.description ?? body.subtitle ?? "";
  }
  if (hasOwn(body, "banner_image") || hasOwn(body, "image")) {
    updates.banner_image = body.banner_image ?? body.image ?? "";
  }
  if (hasOwn(body, "discount_percentage") || hasOwn(body, "discountPercent") || hasOwn(body, "discount")) {
    const discountPercentage = Number(
      body.discount_percentage ?? body.discountPercent ?? body.discount ?? 0
    );
    updates.discount_percentage = Number.isNaN(discountPercentage) ? 0 : discountPercentage;
  }
  if (hasOwn(body, "linked_product_id") || hasOwn(body, "targetProduct")) {
    updates.linked_product_id = normalizeOptionalObjectId(body.linked_product_id ?? body.targetProduct) ?? null;
  }
  if (hasOwn(body, "linked_category") || hasOwn(body, "targetCategory") || hasOwn(body, "category")) {
    updates.linked_category = body.linked_category ?? body.targetCategory ?? body.category ?? "";
  }
  if (hasOwn(body, "is_active") || hasOwn(body, "isActive") || hasOwn(body, "active")) {
    updates.is_active =
      body.is_active !== undefined
        ? !!body.is_active
        : body.isActive !== undefined
          ? !!body.isActive
          : !!body.active;
  }
  if (hasOwn(body, "priority")) updates.priority = Number(body.priority ?? 0);
  if (hasOwn(body, "badge")) updates.badge = body.badge ?? "";
  if (hasOwn(body, "bg")) updates.bg = body.bg;
  if (hasOwn(body, "accent")) updates.accent = body.accent;

  return updates;
};

const getOffers    = asyncHandler(async (req, res) => {
  const offers = await Offer.find()
    .sort({ is_active: -1, priority: -1, created_at: -1 })
    .populate("linked_product_id", "name image images price mrp category");
  res.json(offers);
});

const createOffer  = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title) { res.status(400); throw new Error("title is required"); }

  const offer = await Offer.create(normalizeOfferPayload(req.body));
  const populated = await Offer.findById(offer._id)
    .populate("linked_product_id", "name image images price mrp category");
  res.status(201).json(populated);
});

const updateOffer  = asyncHandler(async (req, res) => {
  const updates = buildOfferUpdatePayload(req.body);
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
    .populate("linked_product_id", "name image images price mrp category");
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
  offer.is_active = !offer.is_active;
  await offer.save();
  res.json({ active: offer.is_active, isActive: offer.is_active, is_active: offer.is_active });
});

module.exports = { getOffers, createOffer, updateOffer, deleteOffer, toggleOffer };
