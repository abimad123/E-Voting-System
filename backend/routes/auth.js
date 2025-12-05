// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// ✅ use ONE name for the auth middleware
const auth = require('../middleware/auth');
const verifyTurnstile = require('../middleware/verifyTurnstile');
const router = express.Router();

function ensureAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }
  next();
}


// ---------- Multer storage for ID docs ----------
const idStorage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '..', 'uploads', 'id_docs')),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`);
  },
});
const uploadId = multer({ storage: idStorage });

// ---------- Multer storage for avatars ----------
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '..', 'uploads', 'avatars')),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`);
  },
});
const uploadAvatar = multer({ storage: avatarStorage });

// ---------- Register with KYC ----------
router.post('/register', uploadId.single('idDoc'), async (req, res) => {
  try {
    const { name, email, password, dob, idType, idNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Name, email, password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let idNumberHash = undefined;
    if (idNumber) {
      idNumberHash = crypto
        .createHash('sha256')
        .update(idNumber)
        .digest('hex');
    }

    // age check if dob provided
    let parsedDob = dob ? new Date(dob) : undefined;
    if (parsedDob && !isNaN(parsedDob)) {
      const ageMs = Date.now() - parsedDob.getTime();
      const age = new Date(ageMs).getUTCFullYear() - 1970;
      if (age < 18) {
        return res.status(400).json({ msg: 'Must be 18+ to register' });
      }
    }

    const user = new User({
      name,
      email,
      passwordHash,
      dob: parsedDob || undefined,
      idType,
      idNumberHash,
      idDocPath: req.file ? `/uploads/id_docs/${req.file.filename}` : undefined,
      verificationStatus: 'pending',
    });

    await user.save();

    await AuditLog.create({
      user: user._id,
      action: 'USER_REGISTERED',
      details: { email: user.email },
    });

    res.json({ msg: 'Registered. Awaiting verification.' });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.get('/admin/users', auth, ensureAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.verificationStatus = status;

    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ users });
  } catch (err) {
    console.error('admin users error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});



// ---------- Login ----------
router.post('/login', verifyTurnstile, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ msg: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        avatarUrl: user.avatarUrl || null,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ---------- Get current user ----------
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ---------- Change password ----------
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ msg: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    await AuditLog.create({
      user: user._id,
      action: 'PASSWORD_CHANGED',
      details: {},
    });

    res.json({ msg: 'Password changed successfully' });
  } catch (err) {
    console.error('change-password error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ---------- Upload / update avatar ----------
router.post(
  '/avatar',
  auth,
  uploadAvatar.single('avatar'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
      }

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: 'User not found' });

      user.avatarUrl = `/uploads/avatars/${req.file.filename}`;
      await user.save();

      await AuditLog.create({
        user: user._id,
        action: 'AVATAR_UPDATED',
        details: { avatarUrl: user.avatarUrl },
      });

      res.json({
        msg: 'Avatar updated successfully',
        avatarUrl: user.avatarUrl,
      });
    } catch (err) {
      console.error('avatar error:', err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  }
);

// ---------- Delete account ----------
router.delete('/delete-account', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Password is incorrect' });
    }

    await AuditLog.create({
      user: user._id,
      action: 'ACCOUNT_DELETED',
      details: { email: user.email },
    });

    await User.findByIdAndDelete(user._id);

    res.json({ msg: 'Account deleted successfully' });
  } catch (err) {
    console.error('delete-account error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ---------- Admin verify user ----------
router.post('/admin/verify/:userId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin only' });
    }
    const { action } = req.body; // 'approve' or 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ msg: 'Invalid action' });
    }

    const update = {
      verificationStatus: action === 'approve' ? 'approved' : 'rejected',
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
    };

    await User.findByIdAndUpdate(req.params.userId, update);

    await AuditLog.create({
      user: req.user.id,
      action: 'USER_VERIFICATION',
      details: { target: req.params.userId, result: action },
    });

    res.json({ msg: 'Updated' });
  } catch (err) {
    console.error('admin verify error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
