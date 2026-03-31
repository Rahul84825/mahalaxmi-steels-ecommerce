const dotenv     = require("dotenv");
dotenv.config(); // Load env vars before anything else reads process.env

const http       = require("http");
const express    = require("express");
const cors       = require("cors");
const connectDB  = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { initSocket } = require("./socket");

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",       require("./routes/authRoutes"));
app.use("/api/products",   require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/brands",     require("./routes/brandRoutes"));
app.use("/api/orders",     require("./routes/orderRoutes"));
app.use("/api/offers",     require("./routes/offerRoutes"));
app.use("/api/upload",     require("./routes/uploadRoutes"));
app.use("/api/contact",    require("./routes/contactRoutes"));
app.use("/api/wishlist",   require("./routes/wishlistRoutes"));
app.use("/api/admin",      require("./routes/adminRoutes"));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Mahalaxmi Steels API is running" });
});

app.get("/", (req, res) => {
  res.send("Mahalaxmi Steels Backend API Running");
});
// ── Error Middleware ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
