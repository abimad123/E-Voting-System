// backend/utils/sendEmail.js
const sgMail = require('@sendgrid/mail');

// 1. Initialize with your API Key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("[sendEmail] WARNING: SENDGRID_API_KEY is missing in .env");
}

/**
 * sendEmail(to, subject, text, html)
 * Uses SendGrid Web API (Port 443) to bypass Render's SMTP block.
 */
async function sendEmail(to, subject, text, html = null) {
  // Guard clause: If no key, don't crash, just log it.
  if (!process.env.SENDGRID_API_KEY) {
    console.log("[sendEmail] API Key missing. Would have sent:", { to, subject });
    return;
  }

  // Use the verified sender from env, or fallback to a safety string
  // IMPORTANT: This email MUST be verified in your SendGrid dashboard
  const from = process.env.SMTP_FROM || 'abilegend11@gmail.com'; 

  const msg = {
    to,
    from, 
    subject,
    text, // Plain text version
    html: html || text.replace(/\n/g, '<br>'), // Simple HTML fallback
  };

  try {
    console.log(`[sendEmail] Sending via SendGrid API to: ${to}`);
    await sgMail.send(msg);
    console.log("[sendEmail] ✅ Email sent successfully");
  } catch (error) {
    console.error("[sendEmail] ❌ Failed to send email:");
    
    // Log detailed SendGrid error for debugging
    if (error.response) {
      console.error(JSON.stringify(error.response.body, null, 2));
    } else {
      console.error(error.message);
    }
    
    // We throw error so the controller knows to send a 500 response
    throw new Error("Email could not be sent via SendGrid API");
  }
}

module.exports = sendEmail;