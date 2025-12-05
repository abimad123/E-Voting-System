// src/pages/Login.jsx
import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { loadTurnstileScript } from "../utils/loadTurnstile";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", turnstile: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [isDark, setIsDark] = useState(false); // State for dark mode
  const navigate = useNavigate();
  const widgetRef = useRef(null);
  const widgetIdRef = useRef(null);

  function handleChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  useEffect(() => {
    // Load Turnstile and render widget if site key is present
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (!siteKey) return; // skip if no key (dev fallback)

    let mounted = true;
    loadTurnstileScript()
      .then(() => {
        if (!mounted) return;
        if (!window.turnstile || !widgetRef.current) return;

        // render returns an id for the widget instance
        widgetIdRef.current = window.turnstile.render(widgetRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            setForm((s) => ({ ...s, turnstile: token }));
          },
          "error-callback": () => setForm((s) => ({ ...s, turnstile: "" })),
          "expired-callback": () => setForm((s) => ({ ...s, turnstile: "" })),
        });
      })
      .catch((err) => {
        console.error("Turnstile load error:", err);
      });

    return () => {
      mounted = false;
      try {
        if (window.turnstile && widgetIdRef.current !== null) {
          window.turnstile.remove(widgetIdRef.current);
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    // if Turnstile site key is set, require token
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (siteKey && !form.turnstile) {
      setMsg({ type: "error", text: "Please complete the verification (Turnstile)." });
      setLoading(false);
      return;
    }

    try {
      // send the turnstile token along with credentials
      const res = await api.post("/api/auth/login", form);
      const token = res.data.token;
      const user = res.data.user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setMsg({ type: "success", text: "Login successful — redirecting..." });
      setTimeout(() => {
        if (user.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      }, 700);
    } catch (err) {
      console.error(err);
      const text = err?.response?.data?.msg || err?.message || "Login failed";
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  // Helper to toggle theme
  const toggleTheme = () => setIsDark(!isDark);

  return (
    // Wrap everything in a div that conditionally applies the 'dark' class
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
        
        {/* 1. Official Govt Header (Only for Login Page) */}
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          {/* Top Utility Bar (optional) */}
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Ashoka Emblem */}
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                alt="National Emblem" 
                className="h-14 w-auto object-contain opacity-90 dark:invert dark:opacity-100"
              />
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-bold text-[#0B2447] dark:text-white leading-none">
                  Jan Seva Portal
                </h1>
                <p className="text-xs md:text-sm font-semibold text-[#FF9933] mt-1">
                  Ministry of Electronics & IT, Government of India
                </p>
              </div>
            </div>
            
            <div className="hidden md:block text-right">
               {/* Digital India Logo */}
               <img 
                  src="https://upload.wikimedia.org/wikipedia/en/9/95/Digital_India_logo.svg" 
                  alt="Digital India" 
                  className="h-10 opacity-80 dark:bg-white dark:px-1 dark:rounded"
               />
            </div>
          </div>
        </header>

        {/* 2. Main Login Section */}
        <main className="flex-1 flex items-center justify-center p-4 bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/geometry2.png')] dark:bg-none">
          
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 shadow-lg rounded-t-lg overflow-hidden border border-gray-200 dark:border-slate-700 transition-colors duration-200">
            
            {/* Tricolor Strip - Essential for Govt feel */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>
            
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#0B2447] dark:text-blue-100">Citizen Login</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Sign in to access E-Voting Services
                </p>
              </div>

              {msg && (
                <div className={`mb-6 p-3 text-sm font-medium border-l-4 rounded-r ${
                  msg.type === "success" 
                  ? "bg-green-50 text-green-800 border-green-600 dark:bg-green-900/30 dark:text-green-300" 
                  : "bg-red-50 text-red-800 border-red-600 dark:bg-red-900/30 dark:text-red-300"
                }`}>
                  {msg.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Username / Email ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      value={form.email}
                      autoComplete="username"
                      onChange={handleChange}
                      required
                      type="email"
                      placeholder="Enter your registered email"
                      className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-sm rounded focus:ring-[#0B2447] dark:focus:ring-blue-500 focus:border-[#0B2447] dark:focus:border-blue-500 focus:outline-none focus:ring-1 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type="password" 
                    required 
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-sm rounded focus:ring-[#0B2447] dark:focus:ring-blue-500 focus:border-[#0B2447] dark:focus:border-blue-500 focus:outline-none focus:ring-1 transition-colors"
                  />
                </div>

                {/* Turnstile widget placeholder */}
                <div ref={widgetRef} className="my-2" />

                {/* Login Button with Govt Blue */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded shadow-sm text-sm font-bold text-white bg-[#0B2447] hover:bg-[#1a3a5e] dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2447] dark:focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide transition-all"
                >
                  {loading ? "Authenticating..." : "Secure Login"}
                </button>
              </form>

              {/* Links */}
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-center border-t border-gray-100 dark:border-slate-800 pt-6">
                <button onClick={() => navigate("/register")} className="text-[#0B2447] dark:text-blue-400 font-semibold hover:underline hover:text-[#FF9933] dark:hover:text-yellow-400">
                  New User? Register
                </button>
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="text-gray-500 dark:text-gray-400 hover:text-[#0B2447] dark:hover:text-blue-300"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
            
            {/* Card Footer */}
            <div className="bg-gray-50 dark:bg-slate-800 px-8 py-3 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700">
              Secure Access | IP Logged
            </div>
          </div>
        </main>

        {/* 3. Footer */}
      
      </div>
    </div>
  );
}
