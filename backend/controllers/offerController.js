const asyncHandler = require("express-async-handler");
const Offer        = require("../models/Offer");

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
    linked_product_id: body.linked_product_id ?? body.targetProduct ?? null,
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
  res.status(201).json(offer);
});

const updateOffer  = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) { res.status(404); throw new Error("Offer not found"); }

  const normalized = normalizeOfferPayload(req.body);
  const fields = [
    "title",
    "description",
    "banner_image",
    "discount_percentage",
    "linked_product_id",
    "linked_category",
    "is_active",
    "priority",
    "badge",
    "bg",
    "accent",
  ];

  fields.forEach((f) => {
    if (normalized[f] !== undefined && req.body[f] !== undefined) {
      offer[f] = normalized[f];
    }
  });

  // Backward-compatible update keys.
  if (req.body.image !== undefined) offer.banner_image = normalized.banner_image;
  if (req.body.discountPercent !== undefined || req.body.discount !== undefined) {
    offer.discount_percentage = normalized.discount_percentage;
  }
  if (req.body.targetProduct !== undefined) offer.linked_product_id = normalized.linked_product_id;
  if (req.body.targetCategory !== undefined || req.body.category !== undefined) {
    offer.linked_category = normalized.linked_category;
  }
  if (req.body.isActive !== undefined || req.body.active !== undefined) {
    offer.is_active = normalized.is_active;
  }

  const updated = await offer.save();
  res.json(updated);
});

const deleteOffer  = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) { res.status(404); throw new Error("Offer not found"); }
  await offer.deleteOne();
  res.json({ message: "Offer deleted" });
});

const toggleOffer  = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) { res.status(404); throw new Error("Offer not found"); }
  offer.is_active = !offer.is_active;
  await offer.save();
  res.json({ active: offer.is_active, isActive: offer.is_active, is_active: offer.is_active });
});

module.exports = { getOffers, createOffer, updateOffer, deleteOffer, toggleOffer };
