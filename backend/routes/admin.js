// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');

function ensureAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }
  next();
}

// GET /api/admin/audit-logs?limit=50&action=VOTE_CAST&userId=...
router.get('/audit-logs', auth, ensureAdmin, async (req, res) => {
  try {
    const { action, userId, limit } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (userId) filter.user = userId;

    const lim = Math.min(parseInt(limit) || 50, 200);

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(lim)
      .populate('user', 'name email role')
      .lean();

    res.json({ logs });
  } catch (err) {
    console.error('audit logs error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
