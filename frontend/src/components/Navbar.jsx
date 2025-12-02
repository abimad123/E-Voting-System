// src/components/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 z-50 w-full bg-white shadow-sm">
      <div className="flex items-center justify-between max-w-6xl px-4 py-3 mx-auto">

        {/* BRAND / LOGO */}
        <div
          onClick={() => navigate("/dashboard")}
          className="text-lg font-semibold cursor-pointer"
        >
          E-Voting System
        </div>

        {/* NAV LINKS */}
        <div className="flex items-center gap-4 text-sm">

          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-blue-600"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/help")}
            className="hover:text-blue-600"
          >
            Help
          </button>

          {/* Only admin sees this */}
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="font-medium hover:text-blue-600"
            >
              Admin Panel
            </button>
          )}

          <button
            onClick={() => navigate("/profile")}
            className="hover:text-blue-600"
          >
            Profile
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="font-medium text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}
