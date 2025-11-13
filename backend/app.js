// backend/app.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const electionsRoutes = require('./routes/elections');
const votesRoutes = require('./routes/votes');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/elections', electionsRoutes);
app.use('/api', votesRoutes);

app.get('/', (req, res) => {
  res.send('E-Voting System Backend Running ✅');
});

module.exports = app;
