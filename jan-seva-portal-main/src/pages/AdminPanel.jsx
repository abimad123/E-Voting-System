import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { 
  ArrowLeft, 
  LayoutDashboard, 
  PlusCircle, 
  Archive, 
  Users, 
  FileText, 
  Search, 
  CheckCircle, 
  XCircle, 
  Download, 
  Trash2, 
  RefreshCcw, 
  Clock, 
  ShieldAlert,
  Calendar,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
  Loader2
} from "lucide-react";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [elections, setElections] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [archived, setArchived] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState("all");  
  const [logSearch, setLogSearch] = useState("");

  // create election form
  const [newElection, setNewElection] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    isPublic: true,
  });

  // per-election candidate form state
  const [candidateForm, setCandidateForm] = useState({});
  const baseURL = api.defaults.baseURL || "http://localhost:5000";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // 1. verify admin
        const me = await api.get("/api/auth/me");
        if (me.data.user.role !== "admin") {
          navigate("/dashboard");
          return;
        }
        setUser(me.data.user);

        // 2. parallel loading of elections, archived, pending users, audit logs
       // inside useEffect load()
const [elRes, arRes, uRes, logRes] = await Promise.all([
  api.get("/api/elections"),
  api.get("/api/elections/archived/all"),
  api.get("/api/admin/users?status=pending"),        // 👈 use string 'pending'
  api.get("/api/admin/audit-logs?limit=50"),
]);


        // 3. set states
        setElections(elRes.data.elections || []);
        setArchived(arRes.data.archived || []);
        setPendingUsers(uRes.data.users || []);
        setLogs(logRes.data.logs || []);

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

  const now = new Date();
  const getStatus = (e) => {
    const start = e.startTime ? new Date(e.startTime) : null;
    const end = e.endTime ? new Date(e.endTime) : null;
    if (end && now > end) return "completed";
    if (start && now < start) return "upcoming";
    return "active";
  };

  async function handleCreateElection(e) {
    e.preventDefault();
    setMsg(null);

    try {
      const payload = {
        title: newElection.title,
        description: newElection.description,
        startTime: newElection.startTime
          ? new Date(newElection.startTime).toISOString()
          : null,
        endTime: newElection.endTime
          ? new Date(newElection.endTime).toISOString()
          : null,
        isPublic: newElection.isPublic,
      };

      const res = await api.post("/api/elections", payload);
      setElections((prev) => [res.data.election, ...prev]);
      setNewElection({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        isPublic: true,
      });
      setMsg({ type: "success", text: "Election created." });
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    }
  }

  function handleCandidateFormChange(electionId, field, value) {
    setCandidateForm((prev) => ({
      ...prev,
      [electionId]: {
        ...(prev[electionId] || { name: "", party: "", description: "" }),
        [field]: value,
      },
    }));
  }

  async function handleAddCandidate(electionId) {
    const form = candidateForm[electionId];
    if (!form || !form.name) {
      setMsg({ type: "error", text: "Candidate name is required." });
      return;
    }

    try {
      const res = await api.post(`/api/elections/${electionId}/candidates`, {
        name: form.name,
        party: form.party,
        description: form.description,
      });
      setMsg({
        type: "success",
        text: `Candidate "${res.data.candidate.name}" added.`,
      });
      setCandidateForm((prev) => ({
        ...prev,
        [electionId]: { name: "", party: "", description: "" },
      }));
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    }
  }

  async function handleEndElection(electionId) {
    if (!window.confirm("End this election now?")) return;
    try {
      const res = await api.post(`/api/elections/${electionId}/end`);
      setElections((prev) =>
        prev.map((e) => (e._id === electionId ? res.data.election : e))
      );
      setMsg({ type: "success", text: "Election ended." });
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    }
  }

  async function handleArchive(electionId) {
    if (!window.confirm("Archive this election? It will be hidden from lists.")) {
      return;
    }

    try {
      await api.patch(`/api/elections/${electionId}/archive`);
      setElections(prev => prev.filter(e => e._id !== electionId));
      setMsg({ type: "success", text: "Election archived." });
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    }
  }

  async function handleUnarchive(electionId) {
    try {
      const res = await api.patch(`/api/elections/${electionId}/unarchive`);
      setArchived(prev => prev.filter(e => e._id !== electionId));
      setElections(prev => [res.data.election, ...prev]);
      setMsg({ type: "success", text: "Election restored." });
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    }
  }

  async function handleVerifyUser(userId, action) {
    try {
      await api.post(`/api/auth/admin/verify/${userId}`, { action });
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
      setMsg({
        type: "success",
        text: `User ${action === "approve" ? "approved" : "rejected"}.`,
      });
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    }
  }

  async function handleDownloadResults(electionId, title) {
    try {
      const res = await api.get(`/api/elections/${electionId}/results`);
      const { candidates, totalVotes } = res.data;
      let csv = "Candidate,Party,Votes\n";
      candidates.forEach((c) => {
        csv += `"${c.name}","${c.party}",${c.votesCount || 0}\n`;
      });
      csv += `\nTotal Votes, ,${totalVotes}\n`;

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "election"}-results.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    }
  }
  
  const filteredLogs = logs.filter(log => {
    const matchesFilter =
      logFilter === "all" ? true : log.action === logFilter;

    const s = logSearch.toLowerCase();

    const matchesSearch =
      log.action.toLowerCase().includes(s) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(s)) ||
      (log.user && log.user.email?.toLowerCase().includes(s));

    return matchesFilter && matchesSearch;
  });

  // Avatar Helper
  const avatarSrc = user?.avatarUrl
    ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${user.avatarUrl}`
    : null;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center font-sans">
       <div className="flex items-center gap-2 text-[#0B2447] dark:text-yellow-400 font-semibold animate-pulse">
         <ShieldAlert className="animate-spin" /> Loading Admin Panel...
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] p-4 md:p-8 transition-colors duration-200 font-sans">
      {/* Container Width: 1400px */}
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* --- HEADER CARD (Matching "Welcome" Style) --- */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border-l-4 border-[#0B2447] dark:border-yellow-400 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors duration-200">
            
            <div className="flex items-center gap-5">
                {/* Admin Avatar */}
                <div className="flex items-center justify-center w-20 h-20 overflow-hidden text-3xl font-bold text-gray-400 bg-gray-200 border-2 border-gray-100 rounded-full shadow-sm dark:bg-zinc-800 dark:border-zinc-700">
                    {avatarSrc ? (
                        <img src={avatarSrc} alt="admin avatar" className="object-cover w-full h-full" />
                    ) : (
                        <ShieldAlert size={32} className="text-[#0B2447] dark:text-yellow-400" />
                    )}
                </div>

                {/* Admin Info */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
                        Welcome, <span className="text-[#0B2447] dark:text-yellow-400">{user?.name}</span>
                    </h1>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {user?.email}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                        <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold tracking-wide text-red-700 uppercase bg-red-100 border border-red-200 rounded-full dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                          <ShieldCheck size={14} /> Administrator
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center w-full gap-3 sm:flex-row md:w-auto">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300 transition-colors shadow-sm rounded-lg"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>
            </div>
        </div>

        {/* --- MESSAGES --- */}
        {msg && (
          <div className={`p-4 rounded-lg flex items-center gap-2 border-l-4 shadow-sm ${
              msg.type === "success"
                ? "bg-green-50 text-green-800 border-green-500 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-800 border-red-500 dark:bg-red-900/20 dark:text-red-400"
            }`}>
            {msg.type === 'error' ? <XCircle size={20}/> : <CheckCircle size={20}/>}
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            
            {/* --- LEFT COLUMN: ELECTIONS & USERS --- */}
            <div className="space-y-8 lg:col-span-2">
                
                {/* 1. Create Election Card */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-[#222] border-b border-gray-100 dark:border-zinc-700 flex items-center gap-2">
                        <PlusCircle size={20} className="text-[#0B2447] dark:text-yellow-400" />
                        <h2 className="font-bold text-gray-800 dark:text-white">Create New Election</h2>
                    </div>
                    
                    <div className="p-6">
                        <form onSubmit={handleCreateElection} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Title</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:outline-none"
                                    value={newElection.title}
                                    onChange={(e) => setNewElection((prev) => ({ ...prev, title: e.target.value }))}
                                    required
                                    placeholder="e.g. Student Council 2025"
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Description</label>
                                <textarea
                                    rows="2"
                                    className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:outline-none resize-none"
                                    value={newElection.description}
                                    onChange={(e) => setNewElection((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Brief description of the election..."
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Start Time</label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:outline-none"
                                        value={newElection.startTime}
                                        onChange={(e) => setNewElection((prev) => ({ ...prev, startTime: e.target.value }))}
                                    />
                                    <Calendar className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">End Time</label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:outline-none"
                                        value={newElection.endTime}
                                        onChange={(e) => setNewElection((prev) => ({ ...prev, endTime: e.target.value }))}
                                    />
                                    <Calendar className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    id="isPublic"
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-zinc-800"
                                    checked={newElection.isPublic}
                                    onChange={(e) => setNewElection((prev) => ({ ...prev, isPublic: e.target.checked }))}
                                />
                                <label htmlFor="isPublic" className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    {newElection.isPublic ? <Eye size={16}/> : <EyeOff size={16}/>}
                                    Public Election
                                </label>
                            </div>

                            <div className="flex justify-end md:col-span-2">
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-sm font-bold text-white bg-[#0B2447] rounded-lg hover:bg-[#1a3a5e] dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300 transition-colors shadow-sm"
                                >
                                    Create Election
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* 2. Manage Elections */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-[#222] border-b border-gray-100 dark:border-zinc-700 flex items-center gap-2">
                        <LayoutDashboard size={20} className="text-[#0B2447] dark:text-yellow-400" />
                        <h2 className="font-bold text-gray-800 dark:text-white">Manage Elections</h2>
                    </div>

                    <div className="p-4 space-y-4">
                        {elections.length === 0 ? (
                            <p className="py-4 text-sm text-center text-gray-500">No active elections found.</p>
                        ) : (
                            elections.map((e) => {
                                const status = getStatus(e);
                                const start = e.startTime ? new Date(e.startTime).toLocaleString() : "Not set";
                                const end = e.endTime ? new Date(e.endTime).toLocaleString() : "Not set";
                                const cForm = candidateForm[e._id] || { name: "", party: "", description: "" };

                                return (
                                    <div key={e._id} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-[#151515] hover:border-gray-300 dark:hover:border-zinc-600 transition-colors">
                                        <div className="flex flex-col justify-between gap-4 mb-4 md:flex-row md:items-start">
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{e.title}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{e.description}</p>
                                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-500">
                                                    <span className="flex items-center gap-1"><Clock size={12}/> Start: {start}</span>
                                                    <span className="flex items-center gap-1"><Clock size={12}/> End: {end}</span>
                                                </div>
                                                <div className="mt-2">
                                                    <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase border ${
                                                        status === "completed" ? "bg-gray-100 text-gray-600 border-gray-300 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700" :
                                                        status === "active" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" :
                                                        "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
                                                    }`}>
                                                        {status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
                                                <button onClick={() => navigate(`/elections/${e._id}`)} className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800 transition-colors w-full md:w-auto">
                                                    Open Page
                                                </button>
                                                <button onClick={() => navigate(`/elections/${e._id}/results`)} className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/20 transition-colors w-full md:w-auto">
                                                    Results
                                                </button>
                                                <button onClick={() => handleDownloadResults(e._id, e.title)} className="px-3 py-1.5 text-xs font-medium text-purple-600 border border-purple-200 rounded hover:bg-purple-50 dark:text-purple-400 dark:border-purple-900/50 dark:hover:bg-purple-900/20 transition-colors w-full md:w-auto flex items-center justify-center gap-1">
                                                    <Download size={12}/> CSV
                                                </button>
                                                <button onClick={() => handleArchive(e._id)} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-100 dark:text-gray-400 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors w-full md:w-auto flex items-center justify-center gap-1">
                                                    <Archive size={12}/> Archive
                                                </button>
                                                {status === "active" && (
                                                    <button onClick={() => handleEndElection(e._id)} className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20 transition-colors w-full md:w-auto">
                                                        End Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Add Candidate Inline */}
                                        <div className="pt-3 mt-3 border-t border-gray-100 dark:border-zinc-800">
                                            <label className="block mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">ADD CANDIDATE</label>
                                            <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                                                <input
                                                    type="text"
                                                    placeholder="Name"
                                                    className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-[#222] border border-gray-300 dark:border-zinc-700 rounded focus:outline-none focus:border-blue-500 dark:text-white"
                                                    value={cForm.name}
                                                    onChange={(ev) => handleCandidateFormChange(e._id, "name", ev.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Party"
                                                    className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-[#222] border border-gray-300 dark:border-zinc-700 rounded focus:outline-none focus:border-blue-500 dark:text-white"
                                                    value={cForm.party}
                                                    onChange={(ev) => handleCandidateFormChange(e._id, "party", ev.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Description"
                                                    className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-[#222] border border-gray-300 dark:border-zinc-700 rounded focus:outline-none focus:border-blue-500 dark:text-white"
                                                    value={cForm.description}
                                                    onChange={(ev) => handleCandidateFormChange(e._id, "description", ev.target.value)}
                                                />
                                                <button
                                                    onClick={() => handleAddCandidate(e._id)}
                                                    className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300 transition-colors shadow-sm"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 3. Archived Elections */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-[#222] border-b border-gray-100 dark:border-zinc-700 flex items-center gap-2">
                        <Archive size={20} className="text-gray-500 dark:text-gray-400" />
                        <h2 className="font-bold text-gray-800 dark:text-white">Archived Elections</h2>
                    </div>
                    
                    <div className="p-4 space-y-2">
                        {archived.length === 0 ? (
                            <p className="py-4 text-sm text-center text-gray-500">No archived elections.</p>
                        ) : (
                            archived.map((e) => (
                                <div key={e._id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-zinc-800 rounded bg-gray-50 dark:bg-[#151515]">
                                    <div>
                                        <div className="font-medium text-gray-800 dark:text-gray-200">{e.title}</div>
                                        <div className="max-w-xs text-xs text-gray-500 truncate dark:text-gray-500">{e.description}</div>
                                    </div>
                                    <button
                                        onClick={() => handleUnarchive(e._id)}
                                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-600 transition-colors border border-green-200 rounded hover:bg-green-50 dark:text-green-400 dark:border-green-900/50 dark:hover:bg-green-900/20"
                                    >
                                        <RefreshCcw size={12} /> Restore
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* --- RIGHT COLUMN: USERS & LOGS --- */}
            <div className="space-y-8 lg:col-span-1">
                
                {/* 4. User Verification */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-[#222] border-b border-gray-100 dark:border-zinc-700 flex items-center gap-2">
                        <Users size={20} className="text-[#0B2447] dark:text-yellow-400" />
                        <h2 className="font-bold text-gray-800 dark:text-white">Pending Verification <span className="ml-1 text-xs bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 px-2 py-0.5 rounded-full">{pendingUsers.length}</span></h2>
                    </div>

                    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                        {pendingUsers.length === 0 ? (
                            <p className="py-8 text-sm text-center text-gray-500">No pending verifications.</p>
                        ) : (
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 dark:bg-[#1f1f1f] text-gray-500 dark:text-gray-400 font-semibold sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2">User</th>
                                        <th className="px-3 py-2">ID Doc</th>
                                        <th className="px-3 py-2 text-right">Action</th>
                                    </tr>
                                </thead>
                               <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
  {pendingUsers.map((u) => (
    <tr
      key={u._id}
      className="hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
    >
      {/* USER + ID INFO */}
      <td className="px-3 py-3">
        {/* Name */}
        <div className="font-bold text-gray-800 dark:text-white">
          {u.name}
        </div>

        {/* Email */}
        <div className="text-gray-500 dark:text-gray-500 truncate max-w-[160px]">
          {u.email}
        </div>

        {/* ID Type badge */}
        <div className="mt-1 inline-flex items-center gap-1 text-[10px] bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Type:</span>
          <span>{u.idType || "N/A"}</span>
        </div>

        {/* ID Number (plain text) */}
        <div className="mt-1 text-[10px] text-gray-600 dark:text-gray-400">
          <span className="font-semibold">ID No:</span>{" "}
          {u.idNumber ? (
            <span className="font-mono tracking-wide">{u.idNumber}</span>
          ) : (
            <span className="italic text-gray-400">Not provided</span>
          )}
        </div>
      </td>

      {/* ID DOC / REVIEW PAGE */}
      <td className="px-3 py-3">
        {u.idDocPath ? (
          <button
            type="button"
            onClick={() => navigate(`/admin/users/${u._id}`)}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 transition-colors rounded shadow-sm bg-blue-50 hover:bg-blue-100 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300"
          >
            <FileText size={12} />
            View KYC
          </button>
        ) : (
          <span className="text-xs text-gray-400">No document</span>
        )}
      </td>

      {/* QUICK ACTIONS (still here) */}
      <td className="px-3 py-3 space-y-1 text-right">
        <button
          onClick={() => handleVerifyUser(u._id, "approve")}
          className="flex items-center justify-center w-full gap-1 px-2 py-1 text-green-700 transition-colors rounded bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
        >
          <CheckCircle size={12} /> Approve
        </button>
        <button
          onClick={() => handleVerifyUser(u._id, "reject")}
          className="flex items-center justify-center w-full gap-1 px-2 py-1 text-red-700 transition-colors rounded bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
        >
          <XCircle size={12} /> Reject
        </button>
      </td>
    </tr>
  ))}
</tbody>

                            </table>
                        )}
                    </div>
                </div>

                {/* 5. Audit Logs */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[500px]">
                    <div className="p-4 bg-gray-50 dark:bg-[#222] border-b border-gray-100 dark:border-zinc-700">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText size={20} className="text-gray-500 dark:text-gray-400" />
                            <h2 className="font-bold text-gray-800 dark:text-white">Audit Logs</h2>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <select
                                value={logFilter}
                                onChange={(e) => setLogFilter(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs bg-white dark:bg-[#151515] border border-gray-300 dark:border-zinc-700 rounded focus:outline-none dark:text-white"
                            >
                                <option value="all">All Actions</option>
                                <option value="VOTE_CAST">Vote Cast</option>
                                <option value="USER_REGISTERED">User Registered</option>
                                <option value="USER_VERIFICATION">User Verification</option>
                                <option value="PASSWORD_CHANGED">Password Changed</option>
                                <option value="ACCOUNT_DELETED">Account Deleted</option>
                                <option value="AVATAR_UPDATED">Avatar Updated</option>
                            </select>
                            
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    value={logSearch}
                                    onChange={(e) => setLogSearch(e.target.value)}
                                    className="w-full pl-7 pr-2 py-1.5 text-xs bg-white dark:bg-[#151515] border border-gray-300 dark:border-zinc-700 rounded focus:outline-none dark:text-white"
                                />
                                <Search size={12} className="absolute text-gray-400 left-2 top-2" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto bg-gray-50/50 dark:bg-[#111]">
                        {filteredLogs.length === 0 ? (
                            <p className="py-8 text-sm text-center text-gray-500">No logs match criteria.</p>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {filteredLogs.map((log) => {
                                    const ts = log.timestamp ? new Date(log.timestamp).toLocaleString() : "-";
                                    return (
                                        <div key={log._id} className="p-3 hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors">
                                            <div className="flex items-start justify-between mb-1">
                                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{log.action}</span>
                                                <span className="text-[10px] text-gray-400">{ts}</span>
                                            </div>
                                            <div className="text-[11px] text-gray-600 dark:text-gray-400 mb-1">
                                                User: <span className="font-medium text-gray-800 dark:text-gray-300">{log.user?.email || "Unknown"}</span>
                                            </div>
                                            <div className="text-[10px] font-mono bg-gray-100 dark:bg-[#222] p-1.5 rounded text-gray-500 dark:text-gray-500 break-all">
                                                {log.details ? JSON.stringify(log.details) : "-"}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
}