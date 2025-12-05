// backend/routes/authOtpReset.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { genNumericOtp, sha256 } = require('../utils/crypto');
const sendEmail = require('../utils/email');
const sendSms = require('../utils/sms'); // optional
const bcrypt = require('bcryptjs');
const verifyTurnstile = require('../middleware/verifyTurnstile');
const createLimiter = require('../middleware/rateLimiter'); // ensure path matches your folder

// Config
const OTP_EXPIRE_MIN = +(process.env.OTP_EXPIRE_MIN || 10);
const OTP_MAX_ATTEMPTS = +(process.env.OTP_MAX_ATTEMPTS || 5);

// simple manual validator
function checkRequiredFields(req, fields) {
  for (const f of fields) {
    if (!req.body || typeof req.body[f] === 'undefined' || req.body[f] === '') {
      return false;
    }
  }
  return true;
}

// 1) Request OTP (email or phone)
router.post('/request-reset-otp', createLimiter({ max: 8 }), verifyTurnstile, async (req, res) => {
  try {
    if (!checkRequiredFields(req, ['identifier'])) {
      return res.status(400).json({ msg: 'Invalid request' });
    }

    const { identifier, via = 'email' } = req.body;
    const user = await User.findOne({ email: identifier });

    // generic response to avoid user enumeration
    if (!user) {
      return res.json({ msg: 'If that account exists you will receive a code shortly.' });
    }

    // generate OTP and store hashed
    const otp = genNumericOtp(6);
    console.log('[DEV] Generated OTP for', identifier, ':', otp); // dev-only: remove in prod
    const otpHash = sha256(otp);
    user.resetOtpHash = otpHash;
    user.resetOtpExpires = new Date(Date.now() + OTP_EXPIRE_MIN * 60 * 1000);
    user.resetOtpAttempts = 0;
    await user.save();

    // send via email or sms
    try {
      if (via === 'sms' && process.env.TWILIO_SID) {
        await sendSms(user.phone || identifier, `Your reset code: ${otp} (valid ${OTP_EXPIRE_MIN} min)`);
      } else {
        const html = `
          <p>Dear Citizen,</p>
          <p>Your One-Time Password (OTP) for accessing the <strong>E-Voting Portal</strong> is:</p>
          <h2 style="color:#0B2447; font-size:28px; margin:12px 0;">${otp}</h2>
          <p>This OTP is valid for <strong>${OTP_EXPIRE_MIN} minutes</strong>. Please do not share it with anyone.</p>
          <p>If you did not request this, please ignore this message.</p>
          <br>
          <p>Regards,<br><strong>E-Voting Seva Team</strong></p>
        `;
        await sendEmail(user.email, 'Your OTP for E-Voting Portal', html);
      }
    } catch (sendErr) {
      console.error('ERROR sending OTP (non-fatal):', sendErr);
      // still return generic response so attacker cannot enumerate or deduce send failures
      return res.status(500).json({ msg: 'Unable to send code. Please try again later.' });
    }

    // success response
    return res.json({ msg: 'If that account exists you will receive a code shortly.' });
  } catch (err) {
    console.error('ERROR /request-reset-otp:', err);
    return res.status(500).json({ msg: 'Unable to process request. Please try again later.' });
  }
});

// 2) Verify OTP and set new password
router.post('/verify-otp', createLimiter({ max: 15 }), async (req, res) => {
  try {
    if (!checkRequiredFields(req, ['identifier', 'otp', 'password'])) {
      return res.status(400).json({ msg: 'Invalid input' });
    }
    const { identifier, otp, password } = req.body;
    const user = await User.findOne({ email: identifier });

    if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
      return res.status(400).json({ msg: 'Invalid or expired code' });
    }
    if (user.resetOtpExpires < new Date()) {
      return res.status(400).json({ msg: 'Invalid or expired code' });
    }
    if ((user.resetOtpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ msg: 'Too many attempts' });
    }

    const otpHash = sha256(otp);
    if (otpHash !== user.resetOtpHash) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ msg: 'Invalid code' });
    }

    // success => reset password
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetOtpHash = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = 0;
    user.passwordChangedAt = new Date();
    await user.save();

    // optionally revoke sessions/tokens here

    return res.json({ msg: 'Password reset successful' });
  } catch (err) {
    console.error('ERROR /verify-otp:', err);
    return res.status(500).json({ msg: 'Unable to process request. Please try again later.' });
  }
});

module.exports = router;
