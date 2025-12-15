# 🗳️ Secure E-Voting System

![MERN Stack](https://img.shields.io/badge/MERN-Stack-000000?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

A robust, secure, and modern web-based voting application designed to streamline the election process. This system features a comprehensive KYC (Know Your Customer) verification process, real-time election management, and secure file storage using MongoDB GridFS.

---

## 🚀 Features

### 👤 User Module
* **Secure Registration:** Users register with personal details and must upload a valid ID document (Image/PDF).
* **KYC Verification:** Accounts remain "Pending" until an Administrator verifies their uploaded ID.
* **Secure Voting:** One-vote-per-person policy enforced via database checks.
* **Manifesto Viewing:** Users can view candidate profiles and manifestos before voting.
* **Real-time Status:** Visual feedback on voting status (Active, Voted, Upcoming, Closed).

### 🛡️ Admin Module
* **Dashboard:** Real-time statistics on users, elections, and pending verifications.
* **Identity Verification:** Admins can view uploaded ID documents securely stored in the database and Approve/Reject users.
* **Election Management:** Create, Edit, End, and Archive elections.
* **Candidate Management:** Add candidates with logos and descriptions to specific elections.
* **Audit Logs:** Detailed logs of all critical actions (Votes cast, Users verified, Elections created) for accountability.
* **Results Export:** Download election results as CSV.

### 🎨 UI/UX
* **Responsive Design:** Fully responsive interface built with Tailwind CSS.
* **Dark/Light Mode:** Seamless theme switching with persistent state.
* **Animations:** Smooth transitions using Framer Motion.

---

## 🛠️ Tech Stack

### Frontend
* **React.js (Vite):** Fast, component-based UI.
* **Tailwind CSS:** Modern styling.
* **Framer Motion:** Animations and micro-interactions.
* **Lucide React:** Beautiful, consistent iconography.
* **Axios:** HTTP requests.

### Backend
* **Node.js & Express:** RESTful API architecture.
* **MongoDB (Mongoose):** NoSQL database for flexible data schemas.
* **GridFS:** Native MongoDB file storage system for secure ID and Avatar handling (no local file storage).
* **Multer:** Middleware for handling `multipart/form-data`.
* **JWT (JSON Web Tokens):** Secure authentication.
* **Bcrypt.js:** Password hashing.

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Prerequisites
* Node.js (v16 or higher)
* MongoDB (Local or Atlas Connection String)

### 2. Backend Setup

```bash
# Navigate to the backend folder
cd Backend

# Install dependencies
npm install

# Create a .env file
# Create a file named ".env" in the Backend folder and add the following:
PORT=5000
MONGO_URI=mongodb+srv://<your_connection_string>
JWT_SECRET=your_super_secret_key_here

# Start the server
node server.js

You should see: ✅ MongoDB connected and 🚀 Server running on port 5000

3. Frontend Setup

# Open a new terminal and navigate to the root (or frontend folder)
cd src # (or wherever your package.json for react is)

# Install dependencies
npm install

# Start the development server
npm run dev

