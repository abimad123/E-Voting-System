// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

const User = require('../models/User');
const AuditLog = require('../models/AuditLog'); // make sure this file exists
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ---------- multer setup (ID uploads) ----------
const uploadDir = path.join(__dirname, '..', 'uploads', 'id_docs');
// Make sure this folder exists on disk: backend/uploads/id_docs
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`);
  }
});
const upload = multer({ storage });

// ---------- helper ----------
function calculateAge(dob) {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  const ageDt = new Date(diff);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

// ---------- Register with ID upload ----------
router.post('/register', upload.single('idDoc'), async (req, res) => {
  try {
    const { name, email, password, dob, idType, idNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'name, email and password are required' });
    }

    // age check (optional if dob provided)
    if (dob) {
      const age = calculateAge(dob);
      if (age < 18) return res.status(400).json({ msg: 'Must be 18+ to register' });
    }

    // duplicate email check
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already registered' });

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // hash idNumber if provided
    let idNumberHash = null;
    if (idNumber) {
      idNumberHash = crypto.createHash('sha256').update(String(idNumber)).digest('hex');
      // You could check duplicate idNumberHash here to prevent duplicate registrations:
      // const dup = await User.findOne({ idNumberHash });
      // if (dup) return res.status(400).json({ msg: 'ID already used' });
    }

    const user = new User({
      name,
      email,
      passwordHash,
      dob: dob ? new Date(dob) : undefined,
      idType: idType || undefined,
      idNumberHash,
      idDocPath: req.file ? req.file.path : undefined,
      verificationStatus: 'pending'
    });

    await user.save();

    // optional: create audit log
    await AuditLog.create({ user: user._id, action: 'USER_REGISTERED', details: { email: user.email } });

    res.json({ msg: 'Registered. Awaiting verification.' });
  } catch (err) {
    console.error('Register error:', err);
    // handle duplicate key on email gracefully
    if (err.code === 11000) return res.status(400).json({ msg: 'Email already registered' });
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ---------- Login ----------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, name: user.name, role: user.role, verificationStatus: user.verificationStatus } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ---------- Protected route: get current user ----------
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('GET /me error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ---------- Admin: approve/reject user verification ----------
router.post('/admin/verify/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
    const { action } = req.body; // 'approve' or 'reject'
    if (!action || !['approve', 'reject'].includes(action)) return res.status(400).json({ msg: 'action must be "approve" or "reject"' });

    const update = {
      verificationStatus: action === 'approve' ? 'approved' : 'rejected',
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    };

    await User.findByIdAndUpdate(req.params.userId, update);

    // audit log
    await AuditLog.create({ user: req.user.id, action: 'USER_VERIFICATION', details: { target: req.params.userId, result: action } });

    res.json({ msg: 'Updated' });
  } catch (err) {
    console.error('Admin verify error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
