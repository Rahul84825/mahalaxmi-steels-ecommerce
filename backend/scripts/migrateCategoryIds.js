const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("../config/db");
const Product = require("../models/Product");
const Category = require("../models/Category");

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const titleize = (value = "") =>
  String(value)
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

async function upsertCanonicalCategory(rawCategory) {
  const name =
    rawCategory.name ||
    rawCategory.label ||
    titleize(rawCategory.id || "Category");

  const image = rawCategory.image || rawCategory.icon || "";
  const isActive =
    rawCategory.is_active !== undefined
      ? !!rawCategory.is_active
      : rawCategory.isActive !== undefined
        ? !!rawCategory.isActive
        : rawCategory.active !== undefined
          ? !!rawCategory.active
          : true;

  await Category.collection.updateOne(
    { _id: rawCategory._id },
    { $set: { name, image, is_active: isActive } }
  );
}

async function buildCategoryLookup() {
  const categoriesRaw = await Category.collection.find({}).toArray();

  for (const rawCategory of categoriesRaw) {
    await upsertCanonicalCategory(rawCategory);
  }

  const canonical = await Category.find({}).lean();
  const byId = new Map();
  const byKey = new Map();

  canonical.forEach((cat) => {
    byId.set(String(cat._id), cat);
    byKey.set(slugify(cat.name), cat);
    byKey.set(String(cat.name || "").toLowerCase(), cat);
  });

  return { byId, byKey };
}

async function resolveCategoryId(legacyValue, lookup) {
  if (!legacyValue) return null;

  const asString = String(legacyValue).trim();

  if (lookup.byId.has(asString)) {
    return lookup.byId.get(asString)._id;
  }

  const byDirect = lookup.byKey.get(asString.toLowerCase()) || lookup.byKey.get(slugify(asString));
  if (byDirect) return byDirect._id;

  const created = await Category.create({
    name: titleize(asString),
    image: "",
    is_active: true,
  });

  lookup.byId.set(String(created._id), created);
  lookup.byKey.set(slugify(created.name), created);
  lookup.byKey.set(String(created.name || "").toLowerCase(), created);

  return created._id;
}

async function migrateProducts() {
  const lookup = await buildCategoryLookup();

  const rawProducts = await Product.collection.find({}).toArray();

  let migrated = 0;
  let skipped = 0;

  for (const rawProduct of rawProducts) {
    if (rawProduct.category_id) {
      skipped += 1;
      continue;
    }

    const legacyCategory = rawProduct.category || rawProduct.categoryId || null;
    const resolvedCategoryId = await resolveCategoryId(legacyCategory, lookup);

    if (!resolvedCategoryId) {
      skipped += 1;
      continue;
    }

    await Product.collection.updateOne(
      { _id: rawProduct._id },
      {
        $set: {
          category_id: new mongoose.Types.ObjectId(resolvedCategoryId),
        },
        $unset: {
          category: "",
          categoryId: "",
        },
      }
    );

    migrated += 1;
  }

  console.log(`Migrated products: ${migrated}`);
  console.log(`Skipped products: ${skipped}`);
}

async function run() {
  try {
    await connectDB();
    await migrateProducts();
    console.log("Category migration completed.");
    process.exit(0);
  } catch (error) {
    console.error("Category migration failed:", error.message);
    process.exit(1);
  }
}

run();
