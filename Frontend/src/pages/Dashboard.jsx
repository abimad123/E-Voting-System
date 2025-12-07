import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { Sun, Moon, User, CheckCircle, XCircle, Clock, FileText, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  
  // Theme state (Note: If using global ThemeContext from App.jsx, this local state might be redundant, 
  // but keeping it as per your provided file to ensure code stability)
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(!isDark);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // current user
        const meRes = await api.get("/api/auth/me");
        setUser(meRes.data.user);

        // all elections
        const elRes = await api.get("/api/elections");
        setElections(elRes.data.elections || []);
      } catch (err) {
        console.error(err);
        if (err?.response?.status === 401) {
          // not logged in
          navigate("/login");
          return;
        }
        setMsg({
          type: "error",
          text: err?.response?.data?.msg || err.message,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  const now = new Date();

  const getStatus = (e) => {
    const start = e.startTime ? new Date(e.startTime) : null;
    const end = e.endTime ? new Date(e.endTime) : null;

    if (end && now > end) return "completed";
    if (start && now < start) return "upcoming";
    return "active";
  };

  if (loading) {
    return (
      <div className={isDark ? "dark" : ""}>
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center transition-colors duration-200">
           <div className="text-xl font-semibold text-[#0B2447] dark:text-yellow-400 animate-pulse">
             Loading Dashboard...
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex flex-col font-sans transition-colors duration-200">
        
        {/* --- HEADER --- */}
      

        {/* --- MAIN CONTENT --- */}
        {/* CHANGED: max-w-6xl -> max-w-[1400px] */}
        <div className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-6 space-y-6">
            
            {/* 1. User Info Card */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-md border-l-4 border-[#0B2447] dark:border-yellow-400 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors duration-200">
                <div className="flex gap-4">
                    <div className="hidden md:flex h-16 w-16 bg-gray-100 dark:bg-zinc-800 rounded-full items-center justify-center text-[#0B2447] dark:text-yellow-400">
                        <User size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                            Welcome, <span className="text-[#0B2447] dark:text-yellow-400">{user?.name || "Voter"}</span>
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                        
                        <div className="mt-2 flex items-center gap-2">
                             <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Verification Status:</span>
                             <span className={`flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full ${
                                 user?.verificationStatus === "approved"
                                 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                 : user?.verificationStatus === "rejected"
                                 ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                 : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                             }`}>
                                 {user?.verificationStatus === "approved" && <CheckCircle size={14} />}
                                 {user?.verificationStatus === "rejected" && <XCircle size={14} />}
                                 {(!user?.verificationStatus || user?.verificationStatus === "pending") && <Clock size={14} />}
                                 <span className="capitalize">{user?.verificationStatus || "pending"}</span>
                             </span>
                        </div>
                    </div>
                </div>

                {/* Admin Button */}
                {user?.role === "admin" && (
                <button
                    onClick={() => navigate("/admin")}
                    className="px-5 py-2 text-sm font-bold text-white bg-[#0B2447] hover:bg-[#1a3a5e] dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300 rounded shadow transition-colors"
                >
                    Admin Dashboard
                </button>
                )}
            </div>

            {/* Error/Success Messages */}
            {msg && (
                <div
                    className={`p-4 rounded border-l-4 ${
                    msg.type === "error"
                        ? "bg-red-50 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-green-50 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    }`}
                >
                    {msg.text}
                </div>
            )}

            {/* 2. Elections List */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 transition-colors duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-[#222] flex items-center justify-between rounded-t-lg">
                    <h2 className="text-lg font-bold text-[#0B2447] dark:text-yellow-400 flex items-center gap-2">
                        <FileText size={20} />
                        Active & Upcoming Elections
                    </h2>
                    <span className="text-xs font-semibold bg-[#0B2447] text-white dark:bg-yellow-400 dark:text-black px-2 py-1 rounded">
                        Total: {elections.length}
                    </span>
                </div>

                <div className="p-4">
                    {elections.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            No elections available at the moment.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                        {elections.map((e) => {
                            const status = getStatus(e);
                            const start = e.startTime
                            ? new Date(e.startTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                            : "Not set";
                            const end = e.endTime
                            ? new Date(e.endTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                            : "Not set";

                            return (
                            <div
                                key={e._id}
                                className="group flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 dark:border-zinc-700 rounded hover:border-[#0B2447] dark:hover:border-yellow-400 bg-white dark:bg-[#111] transition-all duration-200 hover:shadow-md"
                            >
                                <div className="mb-4 md:mb-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-[#0B2447] dark:group-hover:text-yellow-400 transition-colors">
                                            {e.title}
                                        </h3>
                                        <span
                                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                            status === "completed"
                                                ? "bg-gray-100 text-gray-600 border-gray-300 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-600"
                                                : status === "active"
                                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                                : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
                                            }`}
                                        >
                                            {status}
                                        </span>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 max-w-xl">
                                        {e.description || "No description provided."}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-gray-500 font-mono">
                                        <span>Start: <span className="text-gray-700 dark:text-gray-300">{start}</span></span>
                                        <span>End: <span className="text-gray-700 dark:text-gray-300">{end}</span></span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Open Election Button */}
                                    <Link
                                        to={`/elections/${e._id}`}
                                        className="flex items-center gap-1 px-4 py-2 text-sm font-semibold border border-[#0B2447] text-[#0B2447] dark:border-yellow-400 dark:text-yellow-400 rounded hover:bg-[#0B2447] hover:text-white dark:hover:bg-yellow-400 dark:hover:text-black transition-colors"
                                    >
                                        {status === 'active' ? 'Vote Now' : 'View Details'}
                                        <ChevronRight size={14} />
                                    </Link>

                                    {/* Results Button */}
                                    {status === "completed" && (
                                        <Link
                                        to={`/elections/${e._id}/results`}
                                        className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-[#0B2447] hover:bg-[#1a3a5e] dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded transition-colors"
                                        >
                                        Results
                                        </Link>
                                    )}
                                </div>
                            </div>
                            );
                        })}
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}