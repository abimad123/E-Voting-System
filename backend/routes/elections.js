// backend/routes/elections.js
const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const auth = require('../middleware/auth');

const path = require('path');
const crypto = require('crypto');
const multer = require('multer');




const candidateIconStorage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '..', 'uploads', 'candidate_icons')),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(
      null,
      `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`
    );
  },
});
const uploadCandidateIcon = multer({ storage: candidateIconStorage });

function ensureAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ msg: "Admin only" });
  }
  next();
}

function ensureAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }
  next();
}

// 🔹 Archive election (admin)
router.patch('/:id/archive', auth, ensureAdmin, async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );
    if (!election) return res.status(404).json({ msg: 'Election not found' });
    res.json({ msg: 'Election archived', election });
  } catch (err) {
    console.error('archive election error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// 🔹 Unarchive election (admin)
router.patch('/:id/unarchive', auth, ensureAdmin, async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(
      req.params.id,
      { isArchived: false },
      { new: true }
    );
    if (!election) return res.status(404).json({ msg: 'Election not found' });
    res.json({ msg: 'Election restored', election });
  } catch (err) {
    console.error('unarchive election error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// 🔹 Create election (admin only)
router.post('/', auth, ensureAdmin, async (req, res) => {
  try {
    const { title, description, startTime, endTime, isPublic } = req.body;
    const election = new Election({
      title,
      description,
      startTime,
      endTime,
      isPublic,
      isArchived: false,
      createdBy: req.user.id,
    });
    await election.save();
    res.json({ election });
  } catch (err) {
    console.error('create election error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// 🔹 End election early (admin)
router.post('/:id/end', auth, ensureAdmin, async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(
      req.params.id,
      { endTime: new Date() },
      { new: true }
    );
    if (!election) return res.status(404).json({ msg: 'Election not found' });

    res.json({ msg: 'Election ended', election });
  } catch (err) {
    console.error('end election error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// 🔹 List active (non-archived) elections – used by dashboard & admin
router.get('/', async (req, res) => {
  try {
    const elections = await Election.find({ isArchived: { $ne: true } }).sort({
      startTime: -1,
    });
    res.json({ elections });
  } catch (err) {
    console.error('list elections error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// 🔹 List archived elections (admin)
router.get('/archived/all', auth, ensureAdmin, async (req, res) => {
  try {
    const archived = await Election.find({ isArchived: true }).sort({
      startTime: -1,
    });
    res.json({ archived });
  } catch (err) {
    console.error('list archived elections error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// 🔹 Get single election with candidates
router.get('/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).lean();
    if (!election) return res.status(404).json({ msg: 'Election not found' });
    const candidates = await Candidate.find({ election: election._id }).lean();
    res.json({ election, candidates });
  } catch (err) {
    console.error('get election error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 🔹 Add candidate to an election (admin)
router.post(
  "/:id/candidates",
  auth,
  ensureAdmin,
  uploadCandidateIcon.single("icon"),
  async (req, res) => {
    try {
      const { name, party, description, iconUrl } = req.body;

      if (!name) {
        return res.status(400).json({ msg: "Candidate name is required." });
      }

      const election = await Election.findById(req.params.id);
      if (!election) {
        return res.status(404).json({ msg: "Election not found" });
      }

      // 1. Determine the final URL (File upload OR text input OR empty)
      let finalIconUrl = iconUrl || "";
      if (req.file) {
        // Construct path relative to server root
        finalIconUrl = `/uploads/candidate_icons/${req.file.filename}`;
      }

      // 2. Create the Candidate Document separately
      const newCandidate = new Candidate({
        name,
        party,
        description,
        iconUrl: finalIconUrl, 
        election: election._id, // Link it to the election
        votesCount: 0 // Initialize votes
      });

      // 3. Save to Candidate Collection
      await newCandidate.save();

      res.json({ msg: "Candidate added.", candidate: newCandidate });
    } catch (err) {
      console.error("add candidate error:", err);
      res.status(500).json({ msg: "Server error", error: err.message });
    }
  }
);


// 🔹 Results endpoint
router.get('/:id/results', async (req, res) => {
  try {
    const electionId = req.params.id;

    const election = await Election.findById(electionId).lean();
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }

    const candidates = await Candidate.find({ election: electionId })
      .sort({ votesCount: -1, name: 1 })
      .lean();

    const totalVotes = candidates.reduce(
      (sum, c) => sum + (c.votesCount || 0),
      0
    );

    let maxVotes = 0;
    for (const c of candidates) {
      const v = c.votesCount || 0;
      if (v > maxVotes) maxVotes = v;
    }

    const winners = candidates
      .filter((c) => (c.votesCount || 0) === maxVotes && maxVotes > 0)
      .map((c) => c._id);

    return res.json({ election, candidates, totalVotes, winners });
  } catch (err) {
    console.error('results route error:', err);
    res
      .status(500)
      .json({ msg: 'Internal server error', error: err.message });
  }
});

module.exports = router;
