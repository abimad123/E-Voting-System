// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api";

export default function Navbar({ theme, setTheme, hideOnAuth = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadMe() {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await api.get("/api/auth/me");
        if (mounted) setUser(res.data.user);
      } catch {
        setUser(null);
      }
    }
    loadMe();
    return () => (mounted = false);
  }, [token]);

  const isActive = (path) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  // optionally hide navbar on login/register (if hideOnAuth true)
  if (hideOnAuth && ["/login", "/register"].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gov-700 dark:border-gov-800">
      <div className="max-w-6xl px-4 mx-auto">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <div
              className="text-lg font-semibold cursor-pointer text-gov-700 dark:text-gov-50"
              onClick={() => navigate("/dashboard")}
            >
              E-Voting System
            </div>
          </div>

          <div className="items-center hidden gap-4 text-sm md:flex">
            <Link className={`hover:text-gov-600 ${isActive("/dashboard") ? "text-gov-600 font-medium" : "text-gov-700 dark:text-gov-200"}`} to="/dashboard">Dashboard</Link>
            <Link className={`hover:text-gov-600 ${isActive("/help") ? "text-gov-600 font-medium" : "text-gov-700 dark:text-gov-200"}`} to="/help">Help</Link>
            {token && <Link className={`hover:text-gov-600 ${isActive("/profile") ? "text-gov-600 font-medium" : "text-gov-700 dark:text-gov-200"}`} to="/profile">Profile</Link>}
            {user?.role === "admin" && <Link className={`hover:text-gov-600 ${isActive("/admin") ? "text-gov-600 font-medium" : "text-gov-700 dark:text-gov-200"}`} to="/admin">Admin</Link>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50 dark:bg-gov-800 dark:border-gov-700"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>

            {token && <div className="hidden mr-2 text-sm md:block">{user?.name}</div>}

            {!token ? (
              <>
                <button onClick={() => navigate("/login")} className="px-3 py-1 text-sm text-gray-700 border rounded hover:bg-gray-100">Login</button>
                <button onClick={() => navigate("/register")} className="px-3 py-1 text-sm text-white rounded bg-accent-500 hover:bg-accent-600">Register</button>
              </>
            ) : (
              <button onClick={handleLogout} className="px-3 py-1 text-sm text-red-600 border rounded">Logout</button>
            )}

            <button onClick={() => setMobileOpen((s) => !s)} className="px-2 py-1 ml-2 border rounded md:hidden">☰</button>
          </div>
        </div>

        {mobileOpen && (
          <div className="pb-3 md:hidden">
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className={`${isActive("/dashboard") ? "text-gov-600" : "text-gov-700"}`}>Dashboard</Link>
              <Link to="/help" onClick={() => setMobileOpen(false)} className={`${isActive("/help") ? "text-gov-600" : "text-gov-700"}`}>Help</Link>
              {token && <Link to="/profile" onClick={() => setMobileOpen(false)}>Profile</Link>}
              {user?.role === "admin" && <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin</Link>}
              {!token ? (
                <div className="flex gap-2">
                  <button onClick={() => navigate("/login")} className="px-2 py-1 border rounded">Login</button>
                  <button onClick={() => navigate("/register")} className="px-2 py-1 text-white rounded bg-accent-500">Register</button>
                </div>
              ) : (
                <button onClick={handleLogout} className="px-2 py-1 border rounded">Logout</button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
