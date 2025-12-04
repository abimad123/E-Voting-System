// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ElectionDetail from "./pages/ElectionDetail";
import ElectionResults from "./pages/ElectionResults";
import Profile from "./pages/Profile";
import Help from "./pages/HelpFAQ";
import AdminPanel from "./pages/AdminPanel";
import { useLocation } from "react-router-dom";


function isLoggedIn() {
  return !!localStorage.getItem("token");
}

function Layout({ children }) {
  const location = useLocation();
  const hideNav = ["/login", "/register"].includes(location.pathname);
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {!hideNav && <Navbar />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}



/**
 * ProtectedRoute: redirect to /login if not logged in
 */
function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * AdminRoute: quick client check for token + frontend role flag if you store user in localStorage.
 * Backend MUST still validate role.
 */
function AdminRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  // optional: check stored user object for role
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user && user.role === "admin") return children;
  } catch (e) {
    /* fallthrough to allow backend to enforce admin */
  }

  // If front-end doesn't know role, still allow and backend will reject admin-only API calls.
  // If you prefer to block strictly on front-end, uncomment next line:
  // return <Navigate to="/dashboard" replace />;

  return children;
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/help" element={<Help />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/elections/:id"
            element={
              <ProtectedRoute>
                <ElectionDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/elections/:id/results"
            element={
              <ProtectedRoute>
                <ElectionResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin panel - backend still enforces admin role; this wrapper is an extra convenience */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />

          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
