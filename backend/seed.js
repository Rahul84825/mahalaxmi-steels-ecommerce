const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const dotenv   = require("dotenv");
dotenv.config();

const User     = require("./models/User");
const Product  = require("./models/Product");
const Category = require("./models/Category");
const Offer    = require("./models/Offer");

const CATEGORIES = [
  { name: "Stainless Steel",  image: "🥘", is_active: true, legacyKey: "steel" },
  { name: "Copper Utensils",  image: "🏺", is_active: true, legacyKey: "copper" },
  { name: "Pital (Brass)",    image: "✨", is_active: true, legacyKey: "brass" },
  { name: "Pooja Essentials", image: "🪔", is_active: true, legacyKey: "pooja" },
  { name: "Home Appliances",  image: "🔌", is_active: true, legacyKey: "appliances" },
];

const PRODUCTS = [
  { name: "Stainless Steel Kadai",       category: "steel",      price: 899,  originalPrice: 1199, inStock: true,  isNew: false, image: "🥘", description: "Premium quality stainless steel kadai, ideal for everyday cooking." },
  { name: "Copper Water Jug 1L",         category: "copper",     price: 650,  originalPrice: 850,  inStock: true,  isNew: true,  image: "🏺", description: "Pure copper water jug for health benefits." },
  { name: "Brass Puja Thali Set",        category: "pooja",      price: 1299, originalPrice: 1699, inStock: true,  isNew: false, image: "🪔", description: "Complete brass puja thali set for daily worship." },
  { name: "Prestige Mixer Grinder 750W", category: "appliances", price: 3499, originalPrice: 4499, inStock: true,  isNew: false, image: "🔌", description: "Powerful 750W mixer grinder with 3 jars." },
  { name: "Brass Lota Kalash 500ml",     category: "brass",      price: 420,  originalPrice: 550,  inStock: false, isNew: false, image: "✨", description: "Traditional brass lota for puja and daily use." },
  { name: "SS Tiffin Box 3 Layer",       category: "steel",      price: 499,  originalPrice: 699,  inStock: true,  isNew: false, image: "🥘", description: "Leak-proof 3 layer stainless steel tiffin box." },
  { name: "Copper Bottle 1.5L",          category: "copper",     price: 799,  originalPrice: 999,  inStock: true,  isNew: true,  image: "🏺", description: "Pure copper water bottle for Ayurvedic health benefits." },
  { name: "Gas Stove 3 Burner ISI",      category: "appliances", price: 2799, originalPrice: 3299, inStock: true,  isNew: false, image: "🔌", description: "ISI certified 3 burner gas stove with auto ignition." },
  { name: "Brass Diya Set of 6",         category: "pooja",      price: 349,  originalPrice: 499,  inStock: true,  isNew: false, image: "🪔", description: "Beautiful brass diya set for festivals and daily puja." },
  { name: "SS Pressure Cooker 5L",       category: "steel",      price: 1199, originalPrice: 1599, inStock: false, isNew: false, image: "🥘", description: "Heavy duty stainless steel pressure cooker." },
  { name: "Pital Kadai 2L",             category: "brass",      price: 950,  originalPrice: 1200, inStock: true,  isNew: true,  image: "✨", description: "Traditional pital (brass) kadai for authentic cooking." },
  { name: "Electric Pressure Cooker 6L", category: "appliances", price: 4299, originalPrice: 5499, inStock: true,  isNew: false, image: "🔌", description: "Smart electric pressure cooker with 12 cooking modes." },
];

const OFFERS = [
  { title: "Stainless Steel Fest",  subtitle: "Up to 40% off on all SS cookware",       badge: "Limited Time",   discount: "40% OFF", category: "steel",      active: true, bg: "from-slate-800 to-slate-600",   accent: "bg-slate-500",  icon: "🥘" },
  { title: "Copper Wellness Sale",  subtitle: "Ayurvedic copper vessels at best price", badge: "Health Special", discount: "25% OFF", category: "copper",     active: true, bg: "from-orange-700 to-orange-500", accent: "bg-orange-400", icon: "🏺" },
  { title: "Pooja Essentials",      subtitle: "Brass & copper spiritual items",         badge: "Festive Deal",   discount: "30% OFF", category: "pooja",      active: true, bg: "from-red-800 to-red-600",       accent: "bg-red-500",    icon: "🪔" },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Offer.deleteMany({}),
    ]);
    console.log("🗑️  Cleared existing data");

    // Create admin user
    await User.create({
      name:     "Admin",
      email:    "admin@mahalaxmisteels.com",
      password: "Admin@123",
      role:     "admin",
      phone:    "+91 98765 43210",
    });
    console.log("👤 Admin user created → admin@mahalaxmisteels.com / Admin@123");

    // Seed categories, products, offers
    const insertedCategories = await Category.insertMany(
      CATEGORIES.map((c) => ({ name: c.name, image: c.image, is_active: c.is_active }))
    );
    console.log(`📂 ${CATEGORIES.length} categories seeded`);

    const categoryIdMap = insertedCategories.reduce((acc, cat) => {
      const key = CATEGORIES.find((item) => item.name === cat.name)?.legacyKey;
      if (key) acc[key] = cat._id;
      return acc;
    }, {});

    const seededProducts = PRODUCTS.map((p) => {
      const { category, ...rest } = p;
      const resolvedCategoryId = categoryIdMap[category];
      if (!resolvedCategoryId) {
        throw new Error(`Missing category mapping for product \"${p.name}\" (category: ${category})`);
      }

      return {
        ...rest,
        category_id: resolvedCategoryId,
        rating: +(Math.random() * 2 + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 200 + 10),
      };
    });

    await Product.insertMany(seededProducts);
    console.log(`📦 ${PRODUCTS.length} products seeded`);

    await Offer.insertMany(OFFERS);
    console.log(`🏷️  ${OFFERS.length} offers seeded`);

    console.log("\n✅ Database seeded successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin login → mahalxmisteels.com");
    console.log("Password   → Rahulbhai@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
};

seed();