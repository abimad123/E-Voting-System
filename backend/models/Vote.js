// backend/models/Vote.js
const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now }
});

// prevent duplicate votes per election
voteSchema.index({ election: 1, voter: 1 }, { unique: true });

module.exports = mongoose.models.Vote || mongoose.model('Vote', voteSchema);
