const nodemailer = require("nodemailer");

const DEFAULT_FROM = "Mahalaxmi Steels <mahalaxmisteels08@gmail.com>";
let transporter = null;

const getMissingEmailEnvVars = () => {
  const requiredVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
  return requiredVars.filter((name) => !process.env[name]);
};

const assertEmailConfig = () => {
  const missingVars = getMissingEmailEnvVars();

  if (missingVars.length > 0) {
    throw new Error(`Missing email configuration: ${missingVars.join(", ")}`);
  }
};

const getEmailFromAddress = () => process.env.EMAIL_FROM || DEFAULT_FROM;

const getTransporter = () => {
  assertEmailConfig();

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

const verifyEmailService = async () => {
  const smtpTransporter = getTransporter();
  await smtpTransporter.verify();

  return {
    ready: true,
    provider: "nodemailer-brevo-smtp",
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    fromAddress: getEmailFromAddress(),
  };
};

const sendEmail = async (to, subject, html) => {
  assertEmailConfig();

  if (!to) {
    throw new Error("Email recipient is required");
  }

  if (!subject) {
    throw new Error("Email subject is required");
  }

  if (!html) {
    throw new Error("Email html body is required");
  }

  try {
    const smtpTransporter = getTransporter();
    const info = await smtpTransporter.sendMail({
      from: getEmailFromAddress(),
      to,
      subject,
      html,
    });

    return info;
  } catch (err) {
    console.error("Nodemailer sendEmail failed:", {
      message: err.message,
      name: err.name,
      code: err.code,
      command: err.command,
      response: err.response,
      responseCode: err.responseCode,
      to,
      subject,
      host: process.env.SMTP_HOST || null,
      port: process.env.SMTP_PORT || null,
      hasSmtpUser: Boolean(process.env.SMTP_USER),
      hasSmtpPass: Boolean(process.env.SMTP_PASS),
      stack: err.stack,
    });
    throw err;
  }
};

module.exports = { sendEmail, verifyEmailService, assertEmailConfig };