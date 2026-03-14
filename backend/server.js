const dotenv     = require("dotenv");
dotenv.config(); // Load env vars before anything else reads process.env

const express    = require("express");
const cors       = require("cors");
const connectDB  = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { sendEmail, verifyEmailService } = require("./utils/emailService");

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
  const testRecipient = "mahalaxmisteels08@gmail.com";

  try {
    await verifyEmailService();

    const info = await sendEmail(
      testRecipient,
      "SMTP Test",
      "<p>Email working on Render/Vercel with Brevo SMTP + Nodemailer</p>"
    );

    res.json({ success: true, message: "Email sent", messageId: info?.messageId || null });
  } catch (err) {
    console.error("/test-email failed:", {
      message: err.message,
      name: err.name,
      code: err.code,
      responseCode: err.responseCode,
      host: process.env.SMTP_HOST || null,
      port: process.env.SMTP_PORT || null,
      hasSmtpUser: Boolean(process.env.SMTP_USER),
      hasSmtpPass: Boolean(process.env.SMTP_PASS),
      stack: err.stack,
    });
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

  verifyEmailService()
    .then((status) => {
      console.log("✅ Email service ready", {
        provider: status.provider,
        host: status.host,
        port: status.port,
        fromAddress: status.fromAddress,
      });
    })
    .catch((err) => {
      console.error("❌ Email service configuration error", {
        message: err.message,
        name: err.name,
        host: process.env.SMTP_HOST || null,
        port: process.env.SMTP_PORT || null,
        hasSmtpUser: Boolean(process.env.SMTP_USER),
        hasSmtpPass: Boolean(process.env.SMTP_PASS),
        emailFrom: process.env.EMAIL_FROM || null,
        stack: err.stack,
      });
    });
});
