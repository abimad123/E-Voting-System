# E-Voting-System
developing
cd "C:\Users\abiji\OneDrive\Desktop\lpu\LPU Class sem 5\React-projectED\e-voting\backend"

# print token
$vToken

Verified user (email/password) you created earlier: voter1@test.com / pass123 (that user is verificationStatus: "approved" in your logs).
<<<<<<< HEAD
Admin used earlier: admin@example.com / adminpass123.   

Abi, let’s take a breath 🌿
You already have a full backend → database connection → API → frontend pipeline.
You built it step-by-step without realizing how neatly everything is wired together.

Let me show you exactly how your Node.js backend is connected to MongoDB and how the frontend talks to that backend (your "server").

🌐 Your Full Stack Architecture (Simple Overview)
React Frontend  →  Node.js / Express Backend  →  MongoDB Database


Each part talks to the next:

Frontend calls API endpoints using axios (api.js)

Backend handles routes (/api/auth, /api/elections, etc.)

MongoDB stores users, elections, candidates, votes, logs

Everything is already connected.

1️⃣ Where is the database connection?

Your database connection is done in:

backend/server.js

It normally looks like this:

const mongoose = require("mongoose");
require("dotenv").config();
const app = require("./app");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => console.error("DB error:", err));


👉 This file:

Loads your .env

Reads MONGO_URI

Connects to MongoDB Atlas or Local MongoDB

Starts Express server

Your backend is already working, so your DB is already connected successfully.

2️⃣ Where do the models store data?

You use Mongoose models:

models/User.js

models/Election.js

models/Candidate.js

models/Vote.js

models/AuditLog.js

Example:

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  verificationStatus: String,
  idDocPath: String,
  ...
});

module.exports = mongoose.model("User", UserSchema);


This makes MongoDB collections automatically.

3️⃣ How does the backend connect to the frontend?

The frontend sends API requests using:

frontend/src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});


So all requests go to:

http://localhost:5000/api/...


Examples:

/api/auth/login

/api/auth/register

/api/elections

/api/elections/:id/vote

/api/admin/audit-logs

4️⃣ How do we start the server?

From your backend folder:

npm run dev


Or:

nodemon server.js


This:

Connects to MongoDB

Starts Express

You saw this message before:

MongoDB connected
Server running on port 5000


This means the backend + MongoDB are connected.

5️⃣ Where is the .env?

In backend/.env you should have:

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mydb
JWT_SECRET=some-secret-value


If you’re using local MongoDB:

MONGO_URI=mongodb://127.0.0.1:27017/evoting

6️⃣ How does the frontend connect to backend server?

In your frontend:

VITE_API_URL=http://localhost:5000


This is why your frontend is calling your Node backend.

🔥 Your whole system is already fully connected

If you can:

Register user ✔

Upload ID ✔

Login ✔

Create election ✔

Vote ✔

See results ✔

Admin verify users ✔

Audit logs ✔

Archive elections ✔

That means:

✔ Frontend → Backend → Database → Back to frontend

Everything is connected.

🧩 What you might want to check next

If your question is:

“How to deploy this online?”

Then you need:

Backend Deploy

Render / Railway / VPS

Upload your backend folder

Set environment variables:

MONGO_URI

JWT_SECRET

Frontend Deploy

Vercel or Netlify

Set:

VITE_API_URL=https://your-backend-url.com


And done 🎉

Abi, tell me exactly what you meant:
✔ “How does backend connect to MongoDB?”
✔ “How does frontend connect to backend?”
✔ “How to deploy online?”
✔ “How to run backend server properly?”

Pick the one you need explanation for, and I will show you in simple steps.


You’re already using the database + server correctly 👀
Now I’ll explain what is happening behind the scenes in a clean way so you can talk about it in viva / report.
I’ll break it into 3 layers:


Database layer – MongoDB + Mongoose


Backend layer – Node.js / Express API


Frontend layer – React + Axios talking to backend



1️⃣ How Node connects to MongoDB (Database Layer)
In your backend, you have:


MongoDB installed + running locally


Mongoose as the ODM (Object Data Mapper) to talk to MongoDB.


Your steps:
a) .env – connection string
In backend/.env you have something like:
MONGO_URI=mongodb://127.0.0.1:27017/e-voting
JWT_SECRET=yourSuperSecretKey
PORT=5000

This tells your server:


Where MongoDB is running → localhost (127.0.0.1) on default port 27017


Which database name → e-voting


b) server.js – start server + connect DB
Your backend/server.js is basically:
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

So what happens when you run:
npm run dev



nodemon server.js runs


mongoose.connect(MONGO_URI) tries to connect to MongoDB


If success → it prints ✅ MongoDB connected and starts Express server on http://localhost:5000


If fail → logs error and exits


c) Models: how your collections are defined
Example backend/models/User.js:
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['voter', 'admin'], default: 'voter' },
  dob: Date,
  idType: String,
  idNumberHash: String,
  idDocPath: String,
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

This maps to a MongoDB collection called users.
Similarly you have:


Election model → elections collection


Candidate model → candidates collection


Vote model → votes collection


AuditLog model → auditlogs collection


That’s how Node “knows” how to store data in Mongo.

2️⃣ How Express (Node.js) exposes APIs (Backend Layer)
Your main Express app is backend/app.js:
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const electionRoutes = require('./routes/elections');
const voteRoutes = require('./routes/votes');

const app = express();

app.use(cors());
app.use(express.json());

// serve uploaded ID documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api', voteRoutes);

app.get('/', (req, res) => {
  res.send('E-Voting System Backend Running ✅');
});

module.exports = app;

So your API endpoints look like:


POST /api/auth/register → register with KYC + file upload


POST /api/auth/login → login, returns JWT token


GET /api/auth/me → get logged-in user info


POST /api/auth/change-password → change password


POST /api/auth/admin/verify/:userId → approve / reject user


GET /api/auth/admin/users?status=pending → admin user list


POST /api/elections → create election (admin only)


GET /api/elections → list all active (non-archived) elections


GET /api/elections/archived/all → list archived elections


PATCH /api/elections/:id/archive → archive election


POST /api/elections/:id/end → end election early


GET /api/elections/:id → get one election + its candidates


POST /api/elections/:id/candidates → add candidate


POST /api/elections/:id/vote → cast vote


GET /api/elections/:id/vote-status → has this user voted?


GET /api/elections/:id/results → public results


GET /api/admin/audit-logs → admin view of logs


Auth middleware: how the token is used
In backend/middleware/auth.js you have something like:
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const header = req.header('Authorization'); // "Bearer <token>"
  if (!header) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = header.replace('Bearer ', '').trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: ..., role: ... }
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

So:


Frontend sends Authorization: Bearer <token>


Middleware decodes token, attaches req.user


Routes like ensureAdmin check req.user.role === 'admin'


Only then admin actions can be done (verify users, create elections, archive, end election, see audit logs).


That’s how backend and database security are handled.

3️⃣ How React talks to Node (Frontend Layer)
Your frontend runs on Vite dev server: http://localhost:5173
Your backend runs on Express: http://localhost:5000
Because ports differ → you enabled CORS in backend:
app.use(cors());

a) Axios setup
You made src/api.js:
// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: false,
});

// automatically attach token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

So, when you do:
const res = await api.get("/api/auth/me");

Axios actually sends a request to:
GET http://localhost:5000/api/auth/me
Authorization: Bearer <token from localStorage>

b) Login flow (React ↔ Node ↔ MongoDB)


User fills login form in React (/login page)


React calls:
const res = await api.post("/api/auth/login", { email, password });



Backend POST /api/auth/login:


Looks up user in MongoDB (User.findOne({ email }))


Compares password using bcrypt


If ok, creates JWT with user.id and role


Sends { token, user: { ... } } back




Frontend stores token:
localStorage.setItem("token", res.data.token);



Now every future api request automatically includes Authorization header.


c) Dashboard + Elections


Dashboard uses:
const meRes = await api.get("/api/auth/me");
const elRes = await api.get("/api/elections");



Backend hits MongoDB:


/api/auth/me → User.findById(req.user.id)


/api/elections → Election.find({ isArchived: false })




The response goes back to frontend, and you show:


User info


List of elections + statuses (active / upcoming / completed)




d) Voting
When a verified voter clicks Vote:
await api.post(`/api/elections/${id}/vote`, { candidateId });

Backend:


auth middleware checks token → ensures user is logged-in


votes route:


Confirms user is verified


Confirms election is active (time check)


Confirms candidate is part of election


Creates Vote document in MongoDB


Updates Candidate.votesCount ($inc)


Writes an AuditLog document { action: 'VOTE_CAST', ... }




Sends back {"msg": "Vote cast successfully"}


Frontend:


Shows success message


Refreshes candidates list so votes are updated only if election is finished (if you hide counts during active)



4️⃣ How everything fits together (one-line story for viva)
You can literally say this:

“We built a MERN-based E-Voting System.
The React frontend talks to a Node/Express backend using Axios.
The backend connects to MongoDB with Mongoose using a MONGO_URI in .env.
We use JWT-based authentication; the frontend stores the token and sends it in the Authorization header.
All users, elections, candidates, votes, and audit logs are stored in MongoDB collections through Mongoose models.”

If you want, I can also:


Generate a small architecture diagram (ASCII style) you can paste in your report


Or write a “System Architecture” section for your project documentation based on all this.


=======
Admin used earlier: admin@gmail.com / admin123@.   
>>>>>>> 2bed67215ef917a9ba09f8bee7234131e46b8469
