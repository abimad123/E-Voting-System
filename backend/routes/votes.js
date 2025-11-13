// backend/routes/votes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

router.post('/elections/:id/vote', auth, async (req, res) => {
  try {
    const voterId = req.user.id;
    const electionId = req.params.id;
    const { candidateId } = req.body;
    if (!candidateId) return res.status(400).json({ msg: 'candidateId is required' });

    const user = await User.findById(voterId).lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.verificationStatus !== 'approved') return res.status(403).json({ msg: 'Your account is not verified to vote' });

    const election = await Election.findById(electionId).lean();
    if (!election) return res.status(404).json({ msg: 'Election not found' });
    const now = new Date();
    if (election.startTime && now < new Date(election.startTime)) return res.status(400).json({ msg: 'Election has not started yet' });
    if (election.endTime && now > new Date(election.endTime)) return res.status(400).json({ msg: 'Election has already ended' });

    const candidate = await Candidate.findOne({ _id: candidateId, election: electionId });
    if (!candidate) return res.status(404).json({ msg: 'Candidate not found in this election' });

    const vote = new Vote({ election: electionId, candidate: candidateId, voter: voterId });
    await vote.save();

    await Candidate.updateOne({ _id: candidateId }, { $inc: { votesCount: 1 } });

    // IMPORTANT: always include action
    await AuditLog.create({
      user: voterId,
      action: 'VOTE_CAST',
      details: { electionId, candidateId }
    });

    return res.json({ msg: 'Vote cast successfully' });
  } catch (err) {
    console.error('Vote route error:', err);
    if (err && (err.code === 11000 || (err.name === 'MongoError' && err.code === 11000))) {
      return res.status(400).json({ msg: 'You have already voted in this election' });
    }
    return res.status(500).json({ msg: 'Internal server error', error: err.message });
  }
});

module.exports = router;
