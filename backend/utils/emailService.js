const { Resend } = require("resend");

const DEFAULT_FROM = process.env.EMAIL_FROM || "Mahalaxmi Steels <onboarding@resend.dev>";
let resendClient = null;

const getMissingEmailEnvVars = () => {
  const requiredVars = ["RESEND_API_KEY"];
  return requiredVars.filter((name) => !process.env[name]);
};

const assertEmailConfig = () => {
  const missingVars = getMissingEmailEnvVars();

  if (missingVars.length > 0) {
    throw new Error(`Missing email configuration: ${missingVars.join(", ")}`);
  }
};

const getResendClient = () => {
  assertEmailConfig();

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
};

const verifyEmailService = async () => {
  getResendClient();

  return {
    ready: true,
    provider: "resend",
  };
};

const sendEmail = async ({ to, subject, html, text }) => {
  assertEmailConfig();

  if (!to) {
    throw new Error("Email recipient is required");
  }

  if (!subject) {
    throw new Error("Email subject is required");
  }

  try {
    const resend = getResendClient();

    const result = await resend.emails.send({
      from: DEFAULT_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    if (result.error) {
      throw new Error(result.error.message || "Resend API request failed");
    }

    return result.data;
  } catch (err) {
    console.error("Resend sendEmail failed:", {
      message: err.message,
      name: err.name,
      statusCode: err.statusCode,
    });
    throw err;
  }
};

module.exports = { sendEmail, verifyEmailService, assertEmailConfig };