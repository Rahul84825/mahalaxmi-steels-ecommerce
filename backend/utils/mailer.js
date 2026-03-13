const nodemailer = require("nodemailer");

// ── Reusable transporter (created once, shared across the app) ───────────────
const transporter = nodemailer.createTransport({
  host:   "smtp.gmail.com",
  port:   587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT || 15000),
  greetingTimeout:   Number(process.env.EMAIL_GREETING_TIMEOUT || 10000),
  socketTimeout:     Number(process.env.EMAIL_SOCKET_TIMEOUT || 20000),
});

// Verify connection on startup
transporter.verify().then(() => {
  console.log("📧 Mail transporter ready");
}).catch((err) => {
  console.error("📧 Mail transporter error:", err.message);
});

/**
 * Send an email via the shared transporter.
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

module.exports = { transporter, sendEmail };
