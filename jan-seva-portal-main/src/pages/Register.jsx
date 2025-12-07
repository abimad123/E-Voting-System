import React, { useState } from "react";
import api from "../api"; 
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext"; // Import the shared hook

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    idType: "",
    idNumber: "",
  });
  
  const [confirmPassword, setConfirmPassword] = useState("");
  const [idFile, setIdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  
  // USE THE SHARED THEME (Fixes the toggle issue)
  const { isDark, toggleTheme } = useTheme();
  
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (form.password !== confirmPassword) {
      setMsg({ type: "error", text: "Passwords do not match" });
      setLoading(false);
      return;
    }

    setMsg(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("dob", form.dob);
      fd.append("idType", form.idType);
      fd.append("idNumber", form.idNumber);
      if (idFile) fd.append("idDoc", idFile);

      const res = await api.post("/api/auth/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg({ type: "success", text: res.data.msg || "Registered." });
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      console.error(err);
      const text = err?.response?.data?.msg || err?.message || "Registration failed";
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    // Note: The "dark" class is also handled globally by App.jsx, 
    // but we keep it here for local styling consistency if rendered standalone.
    <div className={isDark ? "dark" : ""}>
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
                      {isDark ? <Sun size={20} /> : <Moon size={20} />}
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
             
        {/* --- MAIN FORM SECTION --- */}
        <main className="flex-1 flex items-center justify-center p-4 bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/geometry2.png')] dark:bg-none">
          <div className="w-full max-w-lg overflow-hidden transition-colors duration-200 bg-white border border-gray-200 rounded-t-lg shadow-lg dark:bg-black dark:border-yellow-400">
            
            {/* Tricolor Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>
            
            <div className="p-8">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-[#0B2447] dark:text-yellow-400">New User Registration</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-white">Create an account for E-Voting Services</p>
              </div>

              {msg && (
                <div className={`mb-6 p-3 text-sm font-medium border-l-4 rounded-r ${
                  msg.type === "success" 
                  ? "bg-green-50 text-green-800 border-green-600 dark:bg-green-900 dark:text-white dark:border-green-400" 
                  : "bg-red-50 text-red-800 border-red-600 dark:bg-red-900 dark:text-white dark:border-red-400"
                }`}>
                  {msg.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Name Field */}
                <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-white">Full Name</label>
                    <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    pattern="[A-Za-z\s]+"
                    title="Name should only contain letters and spaces"
                    className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-yellow-400 text-gray-900 dark:text-white text-sm rounded focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-[#0B2447] dark:focus:border-yellow-400 focus:outline-none focus:ring-1 transition-colors dark:placeholder-zinc-500"
                    />
                </div>

                {/* 2. Email Field */}
                <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-white">Email Address</label>
                    <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    type="email"
                    placeholder="Enter your email"
                    className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-yellow-400 text-gray-900 dark:text-white text-sm rounded focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-[#0B2447] dark:focus:border-yellow-400 focus:outline-none focus:ring-1 transition-colors dark:placeholder-zinc-500"
                    />
                </div>

                {/* 3. Password Fields */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-white">Password</label>
                        <input
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        type="password"
                        autoComplete="new-password"
                        placeholder="Create password"
                        className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-yellow-400 text-gray-900 dark:text-white text-sm rounded focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-[#0B2447] dark:focus:border-yellow-400 focus:outline-none focus:ring-1 transition-colors dark:placeholder-zinc-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-white">Confirm Password</label>
                        <input
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleChange}
                        required
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm password"
                        className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-yellow-400 text-gray-900 dark:text-white text-sm rounded focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-[#0B2447] dark:focus:border-yellow-400 focus:outline-none focus:ring-1 transition-colors dark:placeholder-zinc-500"
                        />
                    </div>
                </div>

                {/* 4. DOB and ID Type */}
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-white">Date of Birth</label>
                    <input
                      name="dob"
                      value={form.dob}
                      onChange={handleChange}
                      required
                      type="date"
                      className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-yellow-400 text-gray-900 dark:text-white text-sm rounded focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-[#0B2447] dark:focus:border-yellow-400 focus:outline-none focus:ring-1 transition-colors cursor-pointer [color-scheme:light] dark:[color-scheme:dark] dark:[&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-white">ID Type</label>
                    <select
                      name="idType"
                      value={form.idType}
                      onChange={handleChange}
                      required
                      className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-yellow-400 text-gray-900 dark:text-white text-sm rounded focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-[#0B2447] dark:focus:border-yellow-400 focus:outline-none focus:ring-1 transition-colors"
                    >
                      <option value="">Select ID</option>
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="VoterID">VoterID</option>
                      <option value="StudentID">StudentID</option>
                      <option value="Passport">Passport</option>
                    </select>
                  </div>
                </div>

                {/* 5. ID Number */}
                <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-white">ID Number</label>
                    <input
                    name="idNumber"
                    value={form.idNumber}
                    onChange={handleChange}
                    required
                    placeholder="Enter ID number"
                    className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-yellow-400 text-gray-900 dark:text-white text-sm rounded focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-[#0B2447] dark:focus:border-yellow-400 focus:outline-none focus:ring-1 transition-colors dark:placeholder-zinc-500"
                    />
                </div>

                {/* 6. File Upload */}
                <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-white">Upload ID Document (Image/PDF)</label>
                    <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setIdFile(e.target.files?.[0])}
                    required
                    className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#0B2447] file:text-white hover:file:bg-[#1a3a5e] dark:file:bg-yellow-400 dark:file:text-black dark:hover:file:bg-yellow-300 transition-colors"
                    />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 flex justify-center py-2.5 px-4 border border-transparent rounded shadow-sm text-sm font-bold text-white bg-[#0B2447] hover:bg-[#1a3a5e] dark:bg-[#fff100] dark:text-black dark:hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide transition-all"
                >
                  {loading ? "Registering..." : "Complete Registration"}
                </button>

                <div className="pt-2 text-sm text-center">
                  <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                  <button type="button" onClick={() => navigate("/login")} className="text-[#0B2447] dark:text-yellow-400 font-bold hover:underline">
                    Login
                  </button>
                </div>
              </form>
            </div>
            
            {/* Footer Strip */}
            <div className="bg-gray-50 dark:bg-[#1a1a1a] px-8 py-3 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-zinc-800">
              Secure Access | IP Logged
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}