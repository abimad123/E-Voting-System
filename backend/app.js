// backend/app.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const electionRoutes = require('./routes/elections');
const voteRoutes = require('./routes/votes'); 
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api', voteRoutes);

app.get('/', (req, res) => {
  res.send('E-Voting System Backend Running ✅');
});

module.exports = app;
