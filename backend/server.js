const dotenv     = require("dotenv");
dotenv.config(); // Load env vars before anything else reads process.env

const express    = require("express");
const cors       = require("cors");
const connectDB  = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { transporter } = require("./utils/mailer");

// Connect to MongoDB
connectDB();

const app = express();

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
app.use("/api/orders",     require("./routes/orderRoutes"));
app.use("/api/offers",     require("./routes/offerRoutes"));
app.use("/api/upload",     require("./routes/uploadRoutes"));
app.use("/api/contact",    require("./routes/contactRoutes"));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Mahalaxmi Steels API is running" });
});

app.get("/test-email", async (req, res) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(500).json({
      success: false,
      message: "EMAIL_USER and EMAIL_PASS must be configured",
    });
  }

  try {
    await transporter.verify();

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Render Test",
      text: "Email working on Render",
    });

    res.json({ success: true, message: "Email sent", messageId: info.messageId });
  } catch (err) {
    console.error("/test-email failed:", err.message);
    res.status(500).json({ success: false, message: "Email send failed", error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Mahalaxmi Steels Backend API Running");
});
// ── Error Middleware ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
