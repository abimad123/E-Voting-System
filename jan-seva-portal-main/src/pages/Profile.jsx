import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { 
  ArrowLeft, 
  User, 
  Camera, 
  Lock, 
  LogOut, 
  Trash2, 
  FileText,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Shield
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/api/auth/me");
        setUser(res.data.user);
      } catch (err) {
        console.error(err);
        if (err?.response?.status === 401) {
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

  const verificationBadge = () => {
    const status = user?.verificationStatus || "pending";
    if (status === "approved")
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 uppercase tracking-wide">
          <CheckCircle size={14} /> Approved
        </span>
      );
    if (status === "rejected")
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 uppercase tracking-wide">
          <XCircle size={14} /> Rejected
        </span>
      );
    return (
      <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 uppercase tracking-wide">
        <Clock size={14} /> Pending
      </span>
    );
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await api.post("/api/auth/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((u) => ({ ...u, avatarUrl: res.data.avatarUrl }));
      setMsg({ type: "success", text: res.data.msg });
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setMsg({ type: "error", text: "New passwords do not match" });
      return;
    }

    setBusy(true);
    try {
      const res = await api.post("/api/auth/change-password", {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setMsg({ type: "success", text: res.data.msg });
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    const password = window.prompt(
      "Enter your password to confirm account deletion:"
    );
    if (!password) return;

    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    setBusy(true);
    setMsg(null);
    try {
      const res = await api.delete("/api/auth/delete-account", {
        data: { password },
      });
      setMsg({ type: "success", text: res.data.msg });

      // log out
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center">
       <div className="flex items-center gap-2 text-[#0B2447] dark:text-yellow-400 font-semibold animate-pulse">
         <Loader2 className="animate-spin" /> Loading Profile...
       </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center text-gray-500">
      User not found.
    </div>
  );

  // build avatar URL
  const avatarSrc = user.avatarUrl
    ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${user.avatarUrl}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] p-4 md:p-8 transition-colors duration-200 font-sans">
      {/* Container Width: 1400px */}
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* --- HEADER CARD (Matching "Welcome" Image Style) --- */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border-l-4 border-[#0B2447] dark:border-yellow-400 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors duration-200">
            
            <div className="flex items-center gap-5">
                {/* Avatar with Upload */}
                <div className="relative group">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-800 border-2 border-gray-100 dark:border-zinc-700 shadow-sm flex items-center justify-center text-3xl text-gray-400 font-bold">
                        {avatarSrc ? (
                            <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span>{user.name?.[0]?.toUpperCase() || "U"}</span>
                        )}
                    </div>
                    {/* Hover Camera Icon */}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        {busy ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={busy} />
                    </label>
                </div>

                {/* User Info */}
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome, <span className="text-[#0B2447] dark:text-yellow-400">{user.name}</span>
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {user.email}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Verification Status:</span>
                        {verificationBadge()}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <button
                    onClick={() => navigate("/my-votes")}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#0B2447] hover:bg-[#1a3a5e] dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300 rounded-lg shadow-sm transition-colors"
                >
                    <FileText size={18} />
                    View My Votes
                </button>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-200 dark:border-zinc-700 dark:hover:bg-zinc-700 rounded-lg shadow-sm transition-colors"
                >
                    <ArrowLeft size={18} />
                    Dashboard
                </button>
            </div>
        </div>
        
        {/* --- MESSAGES --- */}
        {msg && (
          <div
            className={`p-4 rounded-lg flex items-center gap-2 border-l-4 ${
              msg.type === "success"
                ? "bg-green-50 text-green-800 border-green-500 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-800 border-red-500 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {msg.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
            {msg.text}
          </div>
        )}

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- LEFT COLUMN: PERSONAL DETAILS --- */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 p-6 transition-colors duration-200">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
                        <User size={20} className="text-[#0B2447] dark:text-yellow-400"/>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Personal Details</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Full Name</label>
                            <div className="text-sm font-medium text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-[#111] rounded border border-gray-200 dark:border-zinc-800">
                                {user.name}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Email Address</label>
                            <div className="text-sm font-medium text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-[#111] rounded border border-gray-200 dark:border-zinc-800">
                                {user.email}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Role</label>
                            <div className="text-sm font-medium text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-[#111] rounded border border-gray-200 dark:border-zinc-800 capitalize flex items-center gap-2">
                                {user.role === 'admin' && <Shield size={14} className="text-red-500" />}
                                {user.role}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Date of Birth</label>
                            <div className="text-sm font-medium text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-[#111] rounded border border-gray-200 dark:border-zinc-800">
                                {user.dob ? new Date(user.dob).toLocaleDateString("en-IN") : "Not set"}
                            </div>
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">ID Document Type</label>
                            <div className="text-sm font-medium text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-[#111] rounded border border-gray-200 dark:border-zinc-800">
                                {user.idType || "Not provided"}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap gap-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <LogOut size={16} />
                            Logout Session
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 dark:bg-zinc-900 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20 transition-colors ml-auto"
                        >
                            <Trash2 size={16} />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN: SECURITY --- */}
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 p-6 transition-colors duration-200 h-full">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
                        <Lock size={20} className="text-[#0B2447] dark:text-yellow-400" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Security</h2>
                    </div>
                    
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Current Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={pwdForm.currentPassword}
                                onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={pwdForm.newPassword}
                                onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={pwdForm.confirmPassword}
                                onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 transition-colors"
                                required
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={busy}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 mt-4 rounded-lg text-sm font-bold text-white shadow-md transition-colors ${
                                busy 
                                ? "bg-gray-400 cursor-not-allowed" 
                                : "bg-[#0B2447] hover:bg-[#1a3a5e] dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300"
                            }`}
                        >
                            {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {busy ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}