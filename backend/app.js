// backend/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const electionRoutes = require('./routes/elections');
const voteRoutes = require('./routes/votes');
const adminRoutes = require('./routes/admin');
const authOtpRouter = require('./routes/authOtpReset');

const app = express();

// CORS
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:8080";

app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Preflight handler (safe — avoids wildcard route parsing issues)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// --------------------------------------------------
// Core Middlewares
// --------------------------------------------------
app.use(express.json());

// Serve uploaded ID documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------------------------------------------
// API Routes
// --------------------------------------------------
app.use('/api/auth', authOtpRouter);  // OTP routes FIRST
app.use('/api/auth', authRoutes);     // normal auth routes
app.use('/api/admin', adminRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api', voteRoutes);

// --------------------------------------------------
// Health check
// --------------------------------------------------
app.get('/', (req, res) => {
  res.send('E-Voting System Backend Running ✅');
});

module.exports = app;
