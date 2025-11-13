// backend/routes/elections.js
const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const auth = require('../middleware/auth');

// Create election (admin only)
router.post('/', auth, async (req, res) => {
    console.log("Candidate API hit:", req.params.id, req.body);

  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
    const { title, description, startTime, endTime, isPublic } = req.body;
    const election = new Election({
      title,
      description,
      startTime,
      endTime,
      isPublic,
      createdBy: req.user.id
    });
    await election.save();
    res.json({ election });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// List elections (public) - can add filters for active only
router.get('/', async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 }).lean();
    res.json({ elections });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single election with candidates
router.get('/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).lean();
    if (!election) return res.status(404).json({ msg: 'Election not found' });
    const candidates = await Candidate.find({ election: election._id }).lean();
    res.json({ election, candidates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add candidate to an election (admin)
router.post('/:id/candidates', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
    const electionId = req.params.id;
    const { name, party, description } = req.body;
    const candidate = new Candidate({ election: electionId, name, party, description });
    await candidate.save();
    res.json({ candidate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
