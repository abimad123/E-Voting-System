// backend/routes/votes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');


// GET /api/elections/:id/vote-status  (protected)
router.get('/elections/:id/vote-status', auth, async (req, res) => {
  try {
    const voterId = req.user.id;
    const electionId = req.params.id;
    const found = await Vote.findOne({ election: electionId, voter: voterId }).lean();
    res.json({ hasVoted: !!found });
  } catch (err) {
    console.error('vote-status error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


router.post('/elections/:id/vote', auth, async (req, res) => {
  const voterId = req.user.id;
  const electionId = req.params.id;
  const { candidateId } = req.body;
  if (!candidateId) return res.status(400).json({ msg: 'candidateId is required' });

  try {
    // Check user verification
    const user = await User.findById(voterId).lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.verificationStatus !== 'approved') return res.status(403).json({ msg: 'Your account is not verified to vote' });

    // Check election
    const election = await Election.findById(electionId).lean();
    if (!election) return res.status(404).json({ msg: 'Election not found' });
    const now = new Date();
    if (election.startTime && now < new Date(election.startTime)) return res.status(400).json({ msg: 'Election has not started yet' });
    if (election.endTime && now > new Date(election.endTime)) return res.status(400).json({ msg: 'Election has already ended' });

    // Check candidate belongs to this election
    const candidate = await Candidate.findOne({ _id: candidateId, election: electionId });
    if (!candidate) return res.status(404).json({ msg: 'Candidate not found in this election' });

    // Prevent duplicate at app level (gives nicer message) - DB unique index still enforces it
    const existing = await Vote.findOne({ election: electionId, voter: voterId });
    if (existing) return res.status(400).json({ msg: 'You have already voted in this election' });

    // Use transaction to create vote + increment candidate + audit log
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const vote = await Vote.create([{ election: electionId, candidate: candidateId, voter: voterId }], { session });
      await Candidate.updateOne({ _id: candidateId }, { $inc: { votesCount: 1 } }, { session });
      await AuditLog.create([{ user: voterId, action: 'VOTE_CAST', details: { electionId, candidateId } }], { session });

      await session.commitTransaction();
      session.endSession();
      return res.json({ msg: 'Vote cast successfully' });
    } catch (errTx) {
      await session.abortTransaction();
      session.endSession();
      // Duplicate key or validation from DB
      if (errTx && errTx.code === 11000) {
        return res.status(400).json({ msg: 'You have already voted in this election' });
      }
      console.error('Vote transaction error:', errTx);
      return res.status(500).json({ msg: 'Internal server error', error: errTx.message });
    }
  } catch (err) {
    console.error('Vote route error:', err);
    return res.status(500).json({ msg: 'Internal server error', error: err.message });
  }
});

module.exports = router;
