import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { loadTurnstileScript } from "../utils/loadTurnstile";
import { 
  Sun, 
  Moon, 
  User, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle 
} from "lucide-react";

// Import the shared theme hook
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", turnstile: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  
  // USE THE SHARED THEME
  const { isDarkMode, toggleTheme } = useTheme();
  
  const navigate = useNavigate();
  const widgetRef = useRef(null);
  const widgetIdRef = useRef(null);

  function handleChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  useEffect(() => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (!siteKey) return; 

    let mounted = true;
    loadTurnstileScript()
      .then(() => {
        if (!mounted) return;
        if (!window.turnstile || !widgetRef.current) return;

        if (widgetIdRef.current) window.turnstile.remove(widgetIdRef.current);

        widgetIdRef.current = window.turnstile.render(widgetRef.current, {
          sitekey: siteKey,
          theme: isDarkMode ? 'dark' : 'light', // Uses shared state
          callback: (token) => setForm((s) => ({ ...s, turnstile: token })),
          "error-callback": () => setForm((s) => ({ ...s, turnstile: "" })),
          "expired-callback": () => setForm((s) => ({ ...s, turnstile: "" })),
        });
      })
      .catch((err) => console.error("Turnstile load error:", err));

    return () => {
      mounted = false;
      try {
        if (window.turnstile && widgetIdRef.current !== null) {
          window.turnstile.remove(widgetIdRef.current);
        }
      } catch (e) { }
    };
  }, [isDarkMode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (siteKey && !form.turnstile) {
      setMsg({ type: "error", text: "Please complete the verification (Turnstile)." });
      setLoading(false);
      return;
    }

    try {
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

  return (
    // Note: We don't need the {isDark ? "dark" : ""} wrapper here anymore 
    // because the ThemeProvider in App.jsx handles the global wrapper.
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex flex-col font-sans transition-colors duration-200">
      
      {/* --- HEADER --- */}
      <header className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-zinc-800 shadow-sm transition-colors duration-200 relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          
          {/* Left: Emblem & Title */}
          <div className="flex items-center gap-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
              alt="National Emblem" 
              className="object-contain w-auto h-12 opacity-90 dark:invert dark:opacity-90"
            />
            <div className="flex flex-col justify-center">
              <h1 className="text-xl md:text-2xl font-bold text-[#0B2447] dark:text-white leading-tight">
                E Voting <span className="text-[#FF9933] dark:text-yellow-400">Portal</span>
              </h1>
              <p className="text-[10px] md:text-xs font-bold text-[#FF9933] tracking-wide uppercase">
                Ministry of Electronics & IT, Government of India
              </p>
            </div>
          </div>
          
          {/* Right: Theme Toggle & Digital India */}
          <div className="flex items-center gap-4">
             <button 
               onClick={toggleTheme}
               className="p-2 text-gray-600 transition-colors bg-gray-100 border border-gray-200 rounded-full dark:bg-zinc-800 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-zinc-700 dark:border-zinc-700"
               title="Toggle Theme"
             >
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <div className="hidden md:block h-8 w-[1px] bg-gray-300 dark:bg-zinc-700"></div>
             <img 
                src="https://upload.wikimedia.org/wikipedia/en/9/95/Digital_India_logo.svg" 
                alt="Digital India" 
                className="hidden w-auto h-10 md:block opacity-80 dark:bg-white dark:p-1 dark:rounded"
             />
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="relative flex items-center justify-center flex-1 p-4">
        
        {/* Optional Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 dark:opacity-[0.02] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md">
          
          {/* Login Card */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-zinc-800 transition-colors duration-200">
            
            {/* Tricolor Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>

            <div className="p-8">
              
              {/* Card Title */}
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-[#0B2447] dark:text-white">Citizen Login</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Secure access to E-Voting Services
                </p>
              </div>

              {/* Messages */}
              {msg && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 text-sm border-l-4 ${
                  msg.type === "success" 
                    ? "bg-green-50 text-green-800 border-green-600 dark:bg-green-900/20 dark:text-green-400" 
                    : "bg-red-50 text-red-800 border-red-600 dark:bg-red-900/20 dark:text-red-400"
                }`}>
                  {msg.type === "success" ? <CheckCircle size={18} className="mt-0.5 shrink-0"/> : <AlertCircle size={18} className="mt-0.5 shrink-0"/>}
                  {msg.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Email Field */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase dark:text-gray-300">
                    Username / Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                      <User size={18} />
                    </div>
                    <input
                      name="email"
                      value={form.email}
                      autoComplete="username"
                      onChange={handleChange}
                      required
                      type="email"
                      placeholder="name@example.com"
                      className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-700 uppercase dark:text-gray-300">
                      Password <span className="text-red-500">*</span>
                      </label>
                      <button 
                          type="button"
                          onClick={() => navigate("/forgot-password")}
                          className="text-xs font-semibold text-[#0B2447] dark:text-yellow-400 hover:underline"
                      >
                          Forgot Password?
                      </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                      <Lock size={18} />
                    </div>
                    <input
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      type="password"
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600"
                    />
                  </div>
                </div>

                {/* Turnstile Widget Placeholder */}
                <div className="flex justify-center my-4 min-h-[65px]">
                   <div ref={widgetRef} />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg shadow-md text-sm font-bold text-white transition-all uppercase tracking-wide ${
                      loading 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-[#0B2447] hover:bg-[#1a3a5e] dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300"
                  }`}
                >
                  {loading ? (
                      <>
                          <Loader2 size={18} className="animate-spin" /> Authenticating...
                      </>
                  ) : (
                      <>
                          Secure Login <ArrowRight size={18} />
                      </>
                  )}
                </button>
              </form>

              {/* Footer Links */}
              <div className="pt-6 mt-6 text-center border-t border-gray-100 dark:border-zinc-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <button 
                      onClick={() => navigate("/register")} 
                      className="font-bold text-[#0B2447] dark:text-yellow-400 hover:underline"
                  >
                      Register Now
                  </button>
                </p>
              </div>

            </div>
            
            {/* Card Bottom Strip */}
            <div className="bg-gray-50 dark:bg-[#222] py-3 text-center border-t border-gray-200 dark:border-zinc-800">
               <p className="text-[10px] text-gray-500 dark:text-gray-500 uppercase tracking-wider font-semibold">
                  Secure Access • 256-bit Encryption • IP Logged
               </p>
            </div>
          </div>
        </div>
      </main>

  

    </div>
  );
}