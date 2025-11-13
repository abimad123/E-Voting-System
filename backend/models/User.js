// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['voter', 'admin'], default: 'voter' },

  // Verification / KYC fields
  dob: { type: Date },
  idType: { type: String },
  idNumberHash: { type: String },
  idDocPath: { type: String },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,

  createdAt: { type: Date, default: Date.now }
});

// use existing compiled model if present (prevents OverwriteModelError in nodemon)
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
