// backend/routes/support.js
const express = require('express');
const router = express.Router();

const SupportTicket = require('../models/SupportTicket');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail'); 

// optional: nodemailer for real email sending
const nodemailer = require('nodemailer');

// --- helper: admin check ---
function ensureAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }
  next();
}


// --------------------------------------------------
// POST /api/support/contact  (user submits ticket)
// --------------------------------------------------
router.post('/contact', async (req, res) => {
  try {
    const { name, email, category, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ msg: 'All required fields must be filled.' });
    }

    const ticket = await SupportTicket.create({
      name,
      email,
      category: category || 'other',
      subject,
      message,
      status: 'open',
    });

    // (optional) log
    await AuditLog.create({
      action: 'SUPPORT_TICKET_CREATED',
      details: { ticketId: ticket._id, email },
    });

    return res.json({
      msg: 'Your message has been submitted. Our support team will contact you soon.',
      ticketId: ticket._id,
    });
  } catch (err) {
    console.error('support contact error:', err);
    return res
      .status(500)
      .json({ msg: 'Server error', error: err.message });
  }
});

// ---------- OPTIONAL: EMAIL TRANSPORTER ----------
// If you don't set these ENV vars, emails won't be sent,
// but the route will STILL work and just log to console.
let transporter = null;

if (
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true', // usually false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('SMTP configured: support emails will be sent.');
} else {
  console.warn(
    'SMTP not fully configured. Support reply emails will NOT be sent; replies will only be stored in DB.'
  );
}

// ---------- POST /api/support/:id/reply ----------
router.post('/:id/reply', auth, ensureAdmin, async (req, res) => {
  try {
    const { subject, message, status } = req.body;

    if (!subject || !message) {
      return res
        .status(400)
        .json({ msg: 'Reply subject and message are required.' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Support ticket not found.' });
    }

    // update ticket
    ticket.responseSubject = subject;
    ticket.responseBody = message;
    if (status) ticket.status = status;
    ticket.respondedBy = req.user.id;
    ticket.respondedAt = new Date();
    await ticket.save();

    // audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'SUPPORT_TICKET_REPLIED',
      details: { ticketId: ticket._id, newStatus: ticket.status },
    });

    // try to send email, but NEVER crash if it fails
    if (transporter) {
      try {
        await transporter.sendMail({
          from:
            process.env.SUPPORT_FROM_EMAIL ||
            process.env.SMTP_USER ||
            'no-reply@evoting.local',
          to: ticket.email,
          subject,
          text: message,
        });

        return res.json({
          msg: 'Reply saved and email sent to user.',
          ticket,
        });
      } catch (mailErr) {
        console.error('support reply email error:', mailErr);
        return res.json({
          msg:
            'Reply saved, but email could not be sent (check SMTP settings/server logs).',
          ticket,
        });
      }
    } else {
      // no SMTP configured – just log what would be sent
      console.log(
        '[Support] Would send email to:',
        ticket.email,
        'Subject:',
        subject,
        'Body:',
        message
      );

      return res.json({
        msg:
          'Reply saved. Email not sent because SMTP is not configured on the server.',
        ticket,
      });
    }
  } catch (err) {
    console.error('support reply error:', err);
    return res
      .status(500)
      .json({ msg: 'Server error while replying to ticket.', error: err.message });
  }
});

module.exports = router;


// --------------------------------------------------
// GET /api/support?status=open|in_progress|closed|all
// Admin list tickets
// --------------------------------------------------
router.get('/', auth, ensureAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ tickets });
  } catch (err) {
    console.error('support list error:', err);
    return res
      .status(500)
      .json({ msg: 'Server error', error: err.message });
  }
});
// POST /api/support/:id/reply
router.post('/:id/reply', auth, ensureAdmin, async (req, res) => {
  try {
    const { subject, message, status } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // update ticket
    ticket.responseSubject = subject;
    ticket.responseBody = message;
    if (status) ticket.status = status;
    ticket.respondedBy = req.user.id;
    ticket.respondedAt = new Date();
    await ticket.save();

    // send email to user
    const bodyText = `
Dear ${ticket.name},

${message}

----------------------------
Ticket ID: ${ticket._id}
Category : ${ticket.category}
Status   : ${ticket.status}

This is an automated email from Official E-Voting Support.
`;

    await sendEmail(ticket.email, subject, bodyText);

    // audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'SUPPORT_TICKET_REPLIED',
      details: {
        ticketId: ticket._id,
        newStatus: ticket.status,
      },
    });

    res.json({ msg: 'Reply sent and ticket updated.' });
  } catch (err) {
    console.error('support reply error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// --------------------------------------------------
// POST /api/support/:id/reply
// Admin replies + update status + (optionally) send email
// --------------------------------------------------
router.post('/:id/reply', auth, ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message, status } = req.body;

    if (!subject || !message) {
      return res
        .status(400)
        .json({ msg: 'Reply subject and message are required.' });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // send mail if transporter configured
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: ticket.email,
          subject,
          text: message,
        });
      } catch (mailErr) {
        console.error('Email sending failed:', mailErr);
        // we will still continue and update ticket
      }
    } else {
      console.log(
        '[SUPPORT] (no SMTP configured) Would send email to',
        ticket.email,
        'Subject:',
        subject
      );
    }

    // update ticket
    ticket.responseSubject = subject;
    ticket.responseBody = message;
    ticket.respondedAt = new Date();
    ticket.respondedBy = req.user.id;
    ticket.status = status || 'closed';

    await ticket.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'SUPPORT_TICKET_REPLIED',
      details: {
        ticketId: ticket._id,
        newStatus: ticket.status,
      },
    });

    return res.json({ msg: 'Reply sent and ticket updated.' });
  } catch (err) {
    console.error('support reply error:', err);
    return res
      .status(500)
      .json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
