const nodemailer = require("nodemailer");

const DEFAULT_FROM = "Mahalaxmi Steels <mahalaxmisteels08@gmail.com>";
const DEFAULT_BREVO_HOST = "smtp-relay.brevo.com";
const FALLBACK_SMTP_PORT = 2525;

let transporter = null;
let activeTransportConfig = null;
let verifiedTransportSignature = null;

const getMissingEmailEnvVars = () => {
  const requiredVars = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"];
  return requiredVars.filter((name) => !process.env[name]);
};

const assertEmailConfig = () => {
  const missingVars = getMissingEmailEnvVars();

  if (missingVars.length > 0) {
    throw new Error(`Missing email configuration: ${missingVars.join(", ")}`);
  }
};

const getEmailFromAddress = () => process.env.EMAIL_FROM || DEFAULT_FROM;

const getConfiguredHost = () => process.env.SMTP_HOST || DEFAULT_BREVO_HOST;

const getConfiguredPort = () => {
  const configuredPort = Number(process.env.SMTP_PORT);
  return Number.isFinite(configuredPort) && configuredPort > 0 ? configuredPort : FALLBACK_SMTP_PORT;
};

const shouldRetryWithFallbackPort = (err, port) => {
  if (port === FALLBACK_SMTP_PORT) {
    return false;
  }

  const message = `${err?.message || ""}`.toLowerCase();
  const code = `${err?.code || ""}`.toUpperCase();

  return ["ETIMEDOUT", "ESOCKET", "ECONNECTION", "ECONNRESET", "EHOSTUNREACH"].includes(code)
    || message.includes("timeout")
    || message.includes("connection")
    || message.includes("greeting never received");
};

const createTransporter = (port) => {
  const smtpTransporter = nodemailer.createTransport({
    host: getConfiguredHost(),
    port,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
  });

  activeTransportConfig = {
    host: getConfiguredHost(),
    port,
  };
  verifiedTransportSignature = null;

  return smtpTransporter;
};

const getTransportSignature = () => `${activeTransportConfig?.host || getConfiguredHost()}:${activeTransportConfig?.port || getConfiguredPort()}`;

const getTransporter = (forcePort) => {
  assertEmailConfig();

  if (!transporter || (forcePort && activeTransportConfig?.port !== forcePort)) {
    transporter = createTransporter(forcePort || getConfiguredPort());
  }

  return transporter;
};

const verifyTransporter = async (smtpTransporter, contextLabel) => {
  await new Promise((resolve, reject) => {
    smtpTransporter.verify((error, success) => {
      if (error) {
        console.error(`SMTP connection error (${contextLabel}):`, {
          message: error.message,
          name: error.name,
          code: error.code,
          response: error.response,
          responseCode: error.responseCode,
          host: activeTransportConfig?.host || getConfiguredHost(),
          port: activeTransportConfig?.port || getConfiguredPort(),
          connectionTimeout: 10000,
          stack: error.stack,
        });
        reject(error);
        return;
      }

      console.log("SMTP server ready", {
        context: contextLabel,
        host: activeTransportConfig?.host || getConfiguredHost(),
        port: activeTransportConfig?.port || getConfiguredPort(),
        success: Boolean(success),
      });
      verifiedTransportSignature = getTransportSignature();
      resolve(success);
    });
  });
};

const getVerifiedTransporter = async (contextLabel) => {
  const preferredPort = getConfiguredPort();
  let smtpTransporter = getTransporter(preferredPort);

  if (verifiedTransportSignature === getTransportSignature()) {
    return smtpTransporter;
  }

  try {
    await verifyTransporter(smtpTransporter, contextLabel);
    return smtpTransporter;
  } catch (err) {
    if (!shouldRetryWithFallbackPort(err, preferredPort)) {
      throw err;
    }

    console.warn("SMTP primary port failed, retrying with fallback port 2525", {
      configuredPort: preferredPort,
      fallbackPort: FALLBACK_SMTP_PORT,
      host: getConfiguredHost(),
      message: err.message,
      code: err.code,
    });

    smtpTransporter = getTransporter(FALLBACK_SMTP_PORT);
    await verifyTransporter(smtpTransporter, `${contextLabel}-fallback`);
    return smtpTransporter;
  }
};

const verifyEmailService = async () => {
  await getVerifiedTransporter("startup");

  return {
    ready: true,
    provider: "nodemailer-brevo-smtp",
    host: activeTransportConfig?.host || getConfiguredHost(),
    port: activeTransportConfig?.port || getConfiguredPort(),
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
    let smtpTransporter = await getVerifiedTransporter("send-email");
    const info = await smtpTransporter.sendMail({
      from: getEmailFromAddress(),
      to,
      subject,
      html,
    });

    return info;
  } catch (err) {
    if (shouldRetryWithFallbackPort(err, activeTransportConfig?.port || getConfiguredPort())) {
      try {
        console.warn("SMTP send failed on primary port, retrying on port 2525", {
          host: getConfiguredHost(),
          configuredPort: activeTransportConfig?.port || getConfiguredPort(),
          fallbackPort: FALLBACK_SMTP_PORT,
          message: err.message,
          code: err.code,
        });

        const fallbackTransporter = getTransporter(FALLBACK_SMTP_PORT);
        await verifyTransporter(fallbackTransporter, "send-email-retry-fallback");
        return await fallbackTransporter.sendMail({
          from: getEmailFromAddress(),
          to,
          subject,
          html,
        });
      } catch (retryErr) {
        console.error("Nodemailer retry sendEmail failed:", {
          message: retryErr.message,
          name: retryErr.name,
          code: retryErr.code,
          command: retryErr.command,
          response: retryErr.response,
          responseCode: retryErr.responseCode,
          to,
          subject,
          host: activeTransportConfig?.host || getConfiguredHost(),
          port: activeTransportConfig?.port || getConfiguredPort(),
          hasSmtpUser: Boolean(process.env.SMTP_USER),
          hasSmtpPass: Boolean(process.env.SMTP_PASS),
          stack: retryErr.stack,
        });
        throw retryErr;
      }
    }

    console.error("Nodemailer sendEmail failed:", {
      message: err.message,
      name: err.name,
      code: err.code,
      command: err.command,
      response: err.response,
      responseCode: err.responseCode,
      to,
      subject,
      host: activeTransportConfig?.host || getConfiguredHost(),
      port: activeTransportConfig?.port || getConfiguredPort(),
      hasSmtpUser: Boolean(process.env.SMTP_USER),
      hasSmtpPass: Boolean(process.env.SMTP_PASS),
      connectionTimeout: 10000,
      stack: err.stack,
    });
    throw err;
  }
};

module.exports = { sendEmail, verifyEmailService, assertEmailConfig };