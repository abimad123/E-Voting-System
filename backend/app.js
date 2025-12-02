// backend/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');


const authRoutes = require('./routes/auth');
const electionRoutes = require('./routes/elections');
const voteRoutes = require('./routes/votes');
const adminRoutes = require('./routes/admin');


const app = express();

app.use(cors());
app.use(express.json());

// serve uploaded ID documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api', voteRoutes);

app.get('/', (req, res) => {
  res.send('E-Voting System Backend Running ✅');
});

module.exports = app;
