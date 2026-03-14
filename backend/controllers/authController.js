const asyncHandler = require("express-async-handler");
const jwt          = require("jsonwebtoken");
const crypto       = require("crypto");
const User         = require("../models/User");
const { sendEmail } = require("../utils/mailer");

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "30d" });

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email and password");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  // Generate verification token
  const verifyToken     = crypto.randomBytes(32).toString("hex");
  const verifyTokenHash = crypto.createHash("sha256").update(verifyToken).digest("hex");

  const user = await User.create({
    name, email, password, phone,
    isVerified:        false,
    verifyToken:       verifyTokenHash,
    verifyTokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  // Send verification email
  const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#1d4ed8;padding:20px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:20px">📧 Verify Your Email</h1>
        <p style="color:#bfdbfe;margin:4px 0 0">Mahalaxmi Steels & Home Appliance</p>
      </div>
      <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
        <p style="color:#374151">Hi <strong>${name}</strong>,</p>
        <p style="color:#374151">
          Thanks for signing up! Please verify your email address to activate your account.
          This link expires in <strong>24 hours</strong>.
        </p>
        <div style="text-align:center;margin:32px 0">
          <a href="${verifyUrl}"
            style="background:#1d4ed8;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block">
            ✅ Verify My Email
          </a>
        </div>
        <p style="color:#6b7280;font-size:13px">
          Or copy and paste this link into your browser:<br/>
          <a href="${verifyUrl}" style="color:#1d4ed8;word-break:break-all">${verifyUrl}</a>
        </p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail(
      email,
      "Verify your email — Mahalaxmi Steels",
      html
    );
  } catch (err) {
    // If email fails, delete the user and return error
    await User.findByIdAndDelete(user._id);
    res.status(500);
    throw new Error("Failed to send verification email. Please check your email address and try again.");
  }

  res.status(201).json({
    message: "Registration successful! Please check your email to verify your account.",
    email,
  });
});

// ── GET /api/auth/verify-email ────────────────────────────────────────────────
const verifyEmail = asyncHandler(async (req, res) => {
  const { token, email } = req.query;

  if (!token || !email) {
    res.status(400);
    throw new Error("Invalid verification link");
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    email:             decodeURIComponent(email),
    verifyToken:       tokenHash,
    verifyTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Verification link is invalid or has expired");
  }

  user.isVerified        = true;
  user.verifyToken       = undefined;
  user.verifyTokenExpiry = undefined;
  await user.save();

  // Send welcome email
  const welcomeHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#16a34a;padding:20px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:20px">🎉 Email Verified!</h1>
        <p style="color:#bbf7d0;margin:4px 0 0">Welcome to Mahalaxmi Steels</p>
      </div>
      <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
        <p style="color:#374151">Hi <strong>${user.name}</strong>,</p>
        <p style="color:#374151">Your email has been verified successfully. You can now log in and start shopping!</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/login"
            style="background:#16a34a;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block">
            Go to Login →
          </a>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center">
          Mahalaxmi Steels & Home Appliance, Pune
        </p>
      </div>
    </div>
  `;

  sendEmail(
    user.email,
    "Welcome to Mahalaxmi Steels! 🎉",
    welcomeHtml
  ).catch((err) => {
    console.error("[email] Welcome email failed", {
      userId: user._id,
      email: user.email,
      message: err.message,
      name: err.name,
      statusCode: err.statusCode,
      stack: err.stack,
    });
  });

  res.json({ message: "Email verified successfully! You can now log in.", success: true });
});

// ── POST /api/auth/resend-verification ───────────────────────────────────────
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if email exists
    return res.json({ message: "If this email is registered, a verification link has been sent." });
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error("This email is already verified. Please log in.");
  }

  // Generate new token
  const verifyToken     = crypto.randomBytes(32).toString("hex");
  const verifyTokenHash = crypto.createHash("sha256").update(verifyToken).digest("hex");

  user.verifyToken       = verifyTokenHash;
  user.verifyTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#1d4ed8;padding:20px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:20px">📧 New Verification Link</h1>
        <p style="color:#bfdbfe;margin:4px 0 0">Mahalaxmi Steels & Home Appliance</p>
      </div>
      <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
        <p style="color:#374151">Hi <strong>${user.name}</strong>,</p>
        <p style="color:#374151">Here's your new verification link. It expires in <strong>24 hours</strong>.</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${verifyUrl}"
            style="background:#1d4ed8;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block">
            ✅ Verify My Email
          </a>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  await sendEmail(email, "New verification link — Mahalaxmi Steels", html);

  res.json({ message: "If this email is registered, a verification link has been sent." });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Block unverified users
  if (!user.isVerified) {
    res.status(403);
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  res.json({
    _id:   user._id,
    name:  user.name,
    email: user.email,
    role:  user.role,
    token: generateToken(user._id),
  });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

// ── PUT /api/auth/profile ─────────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error("User not found"); }

  user.name  = req.body.name  || user.name;
  user.phone = req.body.phone || user.phone;
  if (req.body.password) user.password = req.body.password;

  const updated = await user.save();
  res.json({
    _id:   updated._id,
    name:  updated.name,
    email: updated.email,
    phone: updated.phone,
    role:  updated.role,
    token: generateToken(updated._id),
  });
});

module.exports = { register, login, getMe, updateProfile, verifyEmail, resendVerification };