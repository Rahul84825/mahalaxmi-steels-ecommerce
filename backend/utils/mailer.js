const nodemailer = require("nodemailer");

const getMissingEmailEnvVars = () => {
  const requiredVars = ["EMAIL_USER", "EMAIL_PASS"];
  return requiredVars.filter((name) => !process.env[name]);
};

const assertEmailConfig = () => {
  const missingVars = getMissingEmailEnvVars();
  if (missingVars.length > 0) {
    throw new Error(`Missing email configuration: ${missingVars.join(", ")}`);
  }
};

// ── Reusable transporter (created once, shared across the app) ───────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT || 15000),
  greetingTimeout:   Number(process.env.EMAIL_GREETING_TIMEOUT || 10000),
  socketTimeout:     Number(process.env.EMAIL_SOCKET_TIMEOUT || 20000),
});

const verifyTransporter = async () => {
  assertEmailConfig();

  try {
    await transporter.verify();
    console.log("Mail transporter ready");
  } catch (err) {
    console.error("Mail transporter verify failed:", err.message);
    throw err;
  }
};

verifyTransporter().catch(() => {
  // Startup should keep the API running even if SMTP is temporarily unavailable.
});

/**
 * Send an email via the shared transporter.
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
  assertEmailConfig();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

module.exports = { transporter, sendEmail, verifyTransporter };
