const asyncHandler = require("express-async-handler");
const { sendEmail } = require("../utils/mailer");

// POST /api/contact
const sendContactEmail = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error("name, email and message are required");
  }

  // Email to admin
  await sendEmail({
    to:      process.env.ADMIN_EMAIL,
    subject: `📩 New Contact: ${subject || "General Enquiry"} — ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#1d4ed8">New Contact Form Submission</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;color:#6b7280;width:100px">Name</td>
              <td style="padding:8px;font-weight:600">${name}</td></tr>
          <tr><td style="padding:8px;color:#6b7280">Email</td>
              <td style="padding:8px">${email}</td></tr>
          <tr><td style="padding:8px;color:#6b7280">Phone</td>
              <td style="padding:8px">${phone || "—"}</td></tr>
          <tr><td style="padding:8px;color:#6b7280">Subject</td>
              <td style="padding:8px">${subject || "—"}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px;border-left:4px solid #1d4ed8">
          <p style="margin:0;white-space:pre-wrap;color:#374151">${message}</p>
        </div>
      </div>
    `,
  });

  // Auto-reply to customer
  await sendEmail({
    to:      email,
    subject: "We received your message — Mahalaxmi Steels",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="background:#1d4ed8;padding:20px;border-radius:12px 12px 0 0;text-align:center">
          <h2 style="color:white;margin:0">Thanks for reaching out!</h2>
          <p style="color:#bfdbfe;margin:4px 0 0">Mahalaxmi Steels & Home Appliance</p>
        </div>
        <div style="padding:24px;background:#f8fafc;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
          <p style="color:#374151">Hi <strong>${name}</strong>,</p>
          <p style="color:#374151">
            We've received your message and will get back to you within 24 hours.
          </p>
          <p style="color:#374151">
            In the meantime, feel free to browse our store or call us directly.
          </p>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px">
            Mahalaxmi Steels & Home Appliance, Pune, Maharashtra
          </p>
        </div>
      </div>
    `,
  });

  res.json({ message: "Message sent successfully" });
});

module.exports = { sendContactEmail };
