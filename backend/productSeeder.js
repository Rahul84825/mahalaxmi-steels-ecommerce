const fs = require("fs/promises");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const Category = require("./models/Category");
const Product = require("./models/Product");

dotenv.config();

const IMAGE_DATA_FILE = path.resolve(
  __dirname,
  process.env.CLOUDINARY_IMAGE_OUTPUT_FILE || "cloudinaryImages.json"
);
const SHOULD_CLEAR_PRODUCTS = (process.env.CLEAR_PRODUCTS || "true").toLowerCase() === "true";

const CATEGORIES = [
  { key: "utensils", name: "Utensils", image: "utensils" },
  { key: "kitchen", name: "Kitchen Essentials", image: "kitchen" },
  { key: "appliances", name: "Home Appliances", image: "appliances" },
  { key: "storage", name: "Storage & Serveware", image: "storage" },
  { key: "pooja", name: "Pooja & Brassware", image: "pooja" },
];

const PRODUCTS = [
  {
    name: "Premium Stainless Steel Kadai 3L",
    description: "Triply base stainless steel kadai suitable for daily Indian cooking.",
    price: 1499,
    mrp: 1899,
    stock: 45,
    categoryKey: "utensils",
    imageGroup: "kadai",
    brand: "Mahalaxmi",
    tags: ["stainless steel", "kadai", "cookware"],
  },
  {
    name: "Heavy Duty Pressure Cooker 5L",
    description: "Safe-lock pressure cooker with induction and gas compatibility.",
    price: 2399,
    mrp: 2899,
    stock: 36,
    categoryKey: "kitchen",
    imageGroup: "cooker",
    brand: "Mahalaxmi",
    tags: ["pressure cooker", "kitchen", "induction"],
  },
  {
    name: "Tri-Ply Fry Pan 28cm",
    description: "Scratch-resistant fry pan with ergonomic cool-touch handle.",
    price: 1299,
    mrp: 1599,
    stock: 42,
    categoryKey: "utensils",
    imageGroup: "frypan",
    brand: "Mahalaxmi",
    tags: ["fry pan", "tri-ply", "cookware"],
  },
  {
    name: "Mixer Grinder 750W 3 Jar",
    description: "High torque motor with wet, dry and chutney jar setup.",
    price: 3699,
    mrp: 4299,
    stock: 25,
    categoryKey: "appliances",
    imageGroup: "mixer",
    brand: "Mahalaxmi",
    tags: ["mixer grinder", "appliance", "kitchen"],
  },
  {
    name: "Stainless Steel Saucepan Set",
    description: "Set of three saucepans for boiling milk, tea and sauces.",
    price: 1899,
    mrp: 2299,
    stock: 30,
    categoryKey: "kitchen",
    imageGroup: "saucepan",
    brand: "Mahalaxmi",
    tags: ["saucepan", "stainless steel", "set"],
  },
  {
    name: "Brass Pooja Thali Premium",
    description: "Complete brass pooja thali with diya, bell and kalash.",
    price: 1799,
    mrp: 2199,
    stock: 20,
    categoryKey: "pooja",
    imageGroup: "pooja",
    brand: "Mahalaxmi",
    tags: ["brass", "pooja", "thali"],
  },
  {
    name: "Electric Kettle 1.8L",
    description: "Fast-boil electric kettle with auto cut-off and dry-boil protection.",
    price: 1499,
    mrp: 1899,
    stock: 34,
    categoryKey: "appliances",
    imageGroup: "kettle",
    brand: "Mahalaxmi",
    tags: ["kettle", "electric", "appliance"],
  },
  {
    name: "Dinner Set Stainless Steel 24 Pcs",
    description: "Mirror-finish dinner set for family dining and festive serving.",
    price: 3299,
    mrp: 3999,
    stock: 18,
    categoryKey: "storage",
    imageGroup: "dinnerset",
    brand: "Mahalaxmi",
    tags: ["dinner set", "serveware", "steel"],
  },
  {
    name: "Copper Water Bottle 1L",
    description: "Pure copper bottle with leak-proof cap and polished finish.",
    price: 899,
    mrp: 1199,
    stock: 52,
    categoryKey: "storage",
    imageGroup: "copper",
    brand: "Mahalaxmi",
    tags: ["copper", "water bottle", "health"],
  },
  {
    name: "Stainless Steel Idli Cooker 4 Plate",
    description: "Multi-plate idli cooker for soft idlis with efficient steaming.",
    price: 1699,
    mrp: 2099,
    stock: 27,
    categoryKey: "utensils",
    imageGroup: "idli",
    brand: "Mahalaxmi",
    tags: ["idli", "steamer", "cookware"],
  },
  {
    name: "Gas Stove 3 Burner Auto Ignition",
    description: "ISI certified stainless steel body gas stove with brass burners.",
    price: 4599,
    mrp: 5299,
    stock: 16,
    categoryKey: "appliances",
    imageGroup: "stove",
    brand: "Mahalaxmi",
    tags: ["gas stove", "burner", "appliance"],
  },
  {
    name: "Storage Container Set 6 Pcs",
    description: "Airtight kitchen storage set for grains, pulses and dry snacks.",
    price: 1399,
    mrp: 1799,
    stock: 41,
    categoryKey: "storage",
    imageGroup: "storage",
    brand: "Mahalaxmi",
    tags: ["containers", "storage", "kitchen"],
  },
  {
    name: "Brass Lota Kalash 750ml",
    description: "Traditional handcrafted brass lota for pooja and rituals.",
    price: 999,
    mrp: 1299,
    stock: 29,
    categoryKey: "pooja",
    imageGroup: "lota",
    brand: "Mahalaxmi",
    tags: ["brass", "lota", "ritual"],
  },
  {
    name: "Chapati Tawa 30cm",
    description: "Thick-gauge tawa for evenly cooked chapatis and parathas.",
    price: 1099,
    mrp: 1399,
    stock: 40,
    categoryKey: "utensils",
    imageGroup: "tawa",
    brand: "Mahalaxmi",
    tags: ["tawa", "chapati", "cookware"],
  },
  {
    name: "Electric Rice Cooker 1.8L",
    description: "One-touch operation rice cooker with keep-warm mode.",
    price: 2799,
    mrp: 3299,
    stock: 23,
    categoryKey: "appliances",
    imageGroup: "ricecooker",
    brand: "Mahalaxmi",
    tags: ["rice cooker", "electric", "kitchen"],
  },
  {
    name: "Milk Boiler 2L",
    description: "Whistle-type milk boiler with anti-overflow design.",
    price: 1199,
    mrp: 1499,
    stock: 33,
    categoryKey: "kitchen",
    imageGroup: "boiler",
    brand: "Mahalaxmi",
    tags: ["milk boiler", "kitchen", "steel"],
  },
  {
    name: "Brass Diya Set of 12",
    description: "Decorative brass diya set ideal for festive and temple use.",
    price: 899,
    mrp: 1199,
    stock: 38,
    categoryKey: "pooja",
    imageGroup: "diya",
    brand: "Mahalaxmi",
    tags: ["diya", "brass", "festival"],
  },
  {
    name: "Serving Bowl Set with Lids",
    description: "Insulated serving bowls to keep food warm for longer.",
    price: 1599,
    mrp: 1999,
    stock: 26,
    categoryKey: "storage",
    imageGroup: "serving",
    brand: "Mahalaxmi",
    tags: ["serving", "bowl", "insulated"],
  },
];

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readCloudinaryImageData() {
  if (!(await pathExists(IMAGE_DATA_FILE))) {
    throw new Error(
      `Missing ${path.basename(IMAGE_DATA_FILE)}. Run: node imageSeeder.js first.`
    );
  }

  const raw = await fs.readFile(IMAGE_DATA_FILE, "utf8");
  const data = JSON.parse(raw);

  if (!data || typeof data !== "object") {
    throw new Error(`Invalid image data inside ${IMAGE_DATA_FILE}`);
  }

  return data;
}

function normalizeGroupName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function getImageObjectsForGroup(groupName, imageData) {
  const direct = imageData[groupName];
  if (Array.isArray(direct) && direct.length) {
    return direct;
  }

  const normalizedTarget = normalizeGroupName(groupName);
  const matchedKey = Object.keys(imageData).find(
    (key) => normalizeGroupName(key) === normalizedTarget
  );

  if (matchedKey && Array.isArray(imageData[matchedKey])) {
    return imageData[matchedKey];
  }

  return [];
}

function getImageUrlsFromObjects(imageObjects) {
  return imageObjects
    .map((item) => item && item.url)
    .filter((url) => typeof url === "string" && url.length > 0);
}

async function ensureCategories() {
  const names = CATEGORIES.map((category) => category.name);
  const existing = await Category.find({ name: { $in: names } });
  const byName = new Map(existing.map((category) => [category.name, category]));

  for (const category of CATEGORIES) {
    if (!byName.has(category.name)) {
      const created = await Category.create({
        name: category.name,
        image: category.image,
        is_active: true,
      });
      byName.set(category.name, created);
      console.log(`[category] Created: ${category.name}`);
    } else {
      console.log(`[category] Reused: ${category.name}`);
    }
  }

  return CATEGORIES.reduce((acc, category) => {
    acc[category.key] = byName.get(category.name)._id;
    return acc;
  }, {});
}

function buildProductPayloads(categoryIdMap, imageData) {
  return PRODUCTS.map((product) => {
    const categoryId = categoryIdMap[product.categoryKey];
    if (!categoryId) {
      throw new Error(`Missing category mapping for ${product.name}`);
    }

    const imageObjects = getImageObjectsForGroup(product.imageGroup, imageData);
    const imageUrls = getImageUrlsFromObjects(imageObjects);

    if (!imageUrls.length) {
      console.warn(`[warn] No Cloudinary images found for group: ${product.imageGroup}`);
    }

    return {
      name: product.name,
      description: product.description,
      price: product.price,
      mrp: product.mrp,
      originalPrice: product.mrp,
      stock: product.stock,
      inStock: product.stock > 0,
      category_id: categoryId,
      image: imageUrls[0] || "",
      images: imageUrls,
      brand: product.brand,
      tags: product.tags,
      rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
      reviews: Math.floor(Math.random() * 120 + 5),
    };
  });
}

async function insertProducts(productPayloads) {
  if (SHOULD_CLEAR_PRODUCTS) {
    await Product.deleteMany({});
    await Product.insertMany(productPayloads);
    console.log(`[product] Cleared and inserted ${productPayloads.length} products`);
    return;
  }

  const operations = productPayloads.map((payload) => ({
    updateOne: {
      filter: { name: payload.name },
      update: { $setOnInsert: payload },
      upsert: true,
    },
  }));

  const result = await Product.bulkWrite(operations, { ordered: false });
  const insertedCount = result.upsertedCount || 0;
  console.log(`[product] Upsert completed. New: ${insertedCount}, Existing skipped: ${productPayloads.length - insertedCount}`);
}

async function runProductSeeder() {
  try {
    console.log("[start] Connecting to database...");
    await connectDB();

    console.log(`[start] Reading Cloudinary data from ${IMAGE_DATA_FILE}`);
    const imageData = await readCloudinaryImageData();

    console.log("[start] Ensuring categories...");
    const categoryIdMap = await ensureCategories();

    console.log("[start] Building products...");
    const payloads = buildProductPayloads(categoryIdMap, imageData);

    console.log("[start] Seeding products...");
    await insertProducts(payloads);

    console.log("[done] Product seeding completed successfully");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[error] productSeeder failed: ${error.message}`);
    try {
      await mongoose.connection.close();
    } catch {
      // no-op
    }
    process.exit(1);
  }
}

runProductSeeder();