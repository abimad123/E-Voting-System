// backend/utils/sendEmail.js
const nodemailer = require("nodemailer");

let transporter;

function initTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(
      "[sendEmail] SMTP not fully configured. Emails will NOT be sent."
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, // SendGrid SMTP uses STARTTLS on 587
    auth: {
      user: process.env.SMTP_USER, // "apikey"
      pass: process.env.SMTP_PASS, // your SendGrid API key
    },
  });

  return transporter;
}

/**
 * sendEmail(to, subject, text)
 */
async function sendEmail(to, subject, text) {
  const tx = initTransporter();

  if (!tx) {
    console.log("[sendEmail] Would send email:", { to, subject });
    return;
  }

  const from =
    process.env.SMTP_FROM ||
    `E-Voting <${process.env.SMTP_USER}>`;

  console.log("[sendEmail] Sending email via SMTP:", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    to,
    subject,
  });

  await tx.sendMail({
    from,
    to,
    subject,
    text,
  });

  console.log("[sendEmail] Email sent OK to:", to);
}

module.exports = sendEmail;
