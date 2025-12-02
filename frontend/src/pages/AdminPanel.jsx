// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

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
      const [elRes, arRes, uRes, logRes] = await Promise.all([
        api.get("/api/elections"),
        api.get("/api/elections/archived/all"),
        api.get("/api/auth/admin/users?status=pending"),
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
      // just notify; frontend doesn’t have to re-load entire election list now
      setMsg({
        type: "success",
        text: `Candidate "${res.data.candidate.name}" added.`,
      });
      // clear form for that election
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
    // remove from current list
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
      // remove from pending list
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


  if (loading) return <div className="p-6">Loading admin panel...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Panel</h1>
            <p className="text-sm text-gray-600">
              Logged in as {user?.name} ({user?.email})
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-blue-600 hover:underline"
          >
            ⬅ Back to Dashboard
          </button>
        </div>

        {msg && (
          <div
            className={`p-3 rounded ${
              msg.type === "error"
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Create Election */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-3 text-lg font-semibold">Create New Election</h2>
          <form
            onSubmit={handleCreateElection}
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
          >
            <div>
              <label className="block mb-1 text-xs font-medium">Title</label>
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border rounded"
                value={newElection.title}
                onChange={(e) =>
                  setNewElection((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium">
                Description
              </label>
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border rounded"
                value={newElection.description}
                onChange={(e) =>
                  setNewElection((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium">
                Start Time
              </label>
              <input
                type="datetime-local"
                className="w-full px-2 py-1 text-sm border rounded"
                value={newElection.startTime}
                onChange={(e) =>
                  setNewElection((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium">End Time</label>
              <input
                type="datetime-local"
                className="w-full px-2 py-1 text-sm border rounded"
                value={newElection.endTime}
                onChange={(e) =>
                  setNewElection((prev) => ({
                    ...prev,
                    endTime: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                id="isPublic"
                type="checkbox"
                checked={newElection.isPublic}
                onChange={(e) =>
                  setNewElection((prev) => ({
                    ...prev,
                    isPublic: e.target.checked,
                  }))
                }
              />
              <label htmlFor="isPublic" className="text-xs">
                Public election
              </label>
            </div>
            <div className="flex justify-end md:col-span-2">
              <button
                type="submit"
                className="px-4 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </form>
        </div>

        {/* Elections Management */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-3 text-lg font-semibold">Manage Elections</h2>
          {elections.length === 0 ? (
            <p className="text-sm text-gray-600">No elections yet.</p>
          ) : (
            <div className="space-y-3">
              {elections.map((e) => {
                const status = getStatus(e);
                const start = e.startTime
                  ? new Date(e.startTime).toLocaleString()
                  : "Not set";
                const end = e.endTime
                  ? new Date(e.endTime).toLocaleString()
                  : "Not set";
                const cForm = candidateForm[e._id] || {
                  name: "",
                  party: "",
                  description: "",
                };

                return (
                  <div
                    key={e._id}
                    className="px-3 py-2 space-y-2 border rounded"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{e.title}</div>
                        <div className="text-xs text-gray-600">
                          {e.description}
                        </div>
                        
                        <div className="text-[11px] text-gray-500 mt-1">
                          Start: {start} | End: {end}
                        </div>
                        <div className="text-[11px] mt-1">
                          Status:{" "}
                          <span
                            className={
                              status === "completed"
                                ? "text-gray-700 font-semibold"
                                : status === "active"
                                ? "text-green-600 font-semibold"
                                : "text-yellow-600 font-semibold"
                            }
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/elections/${e._id}`)
                          }
                          className="px-3 py-1 text-xs border rounded hover:bg-gray-100"
                        >
                          Open
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/elections/${e._id}/results`)
                          }
                          className="px-3 py-1 text-xs text-blue-600 border border-blue-400 rounded hover:bg-blue-50"
                        >
                          View Results
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadResults(e._id, e.title)
                          }
                          className="px-3 py-1 text-xs text-purple-600 border border-purple-400 rounded hover:bg-purple-50"
                        >
                          Download CSV
                        </button>
                        <button
  onClick={() => handleArchive(e._id)}
  className="px-3 py-1 text-xs text-red-600 border border-red-400 rounded hover:bg-red-50"
>
  Archive
</button>

                        {status === "active" && (
                          <button
                            onClick={() => handleEndElection(e._id)}
                            className="px-3 py-1 text-xs text-red-600 border border-red-400 rounded hover:bg-red-50"
                          >
                            End Now
                          </button>
                        )}
                      </div>
                    </div>

                    {/* add candidate inline */}
                    <div className="pt-2 mt-1 border-t">
                      <div className="mb-1 text-xs font-semibold">
                        Add Candidate
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-4">
                        <input
                          type="text"
                          placeholder="Name"
                          className="px-2 py-1 border rounded"
                          value={cForm.name}
                          onChange={(ev) =>
                            handleCandidateFormChange(
                              e._id,
                              "name",
                              ev.target.value
                            )
                          }
                        />
                        <input
                          type="text"
                          placeholder="Party"
                          className="px-2 py-1 border rounded"
                          value={cForm.party}
                          onChange={(ev) =>
                            handleCandidateFormChange(
                              e._id,
                              "party",
                              ev.target.value
                            )
                          }
                        />
                        <input
                          type="text"
                          placeholder="Description"
                          className="px-2 py-1 border rounded"
                          value={cForm.description}
                          onChange={(ev) =>
                            handleCandidateFormChange(
                              e._id,
                              "description",
                              ev.target.value
                            )
                          }
                        />
                        <button
                          onClick={() => handleAddCandidate(e._id)}
                          className="px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

         {/* Archived Elections */}
<div className="p-4 bg-white rounded shadow">
  <h2 className="mb-3 text-lg font-semibold">Archived Elections</h2>

  {archived.length === 0 ? (
    <p className="text-sm text-gray-600">No archived elections.</p>
  ) : (
    <div className="space-y-3">
      {archived.map((e) => (
        <div key={e._id} className="px-3 py-2 border rounded">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{e.title}</div>
              <div className="text-xs text-gray-600">{e.description}</div>
            </div>

            <button
              onClick={() => handleUnarchive(e._id)}
              className="px-3 py-1 text-xs text-green-600 border border-green-400 rounded hover:bg-green-50"
            >
              Restore
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

         
        {/* User Verification */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-3 text-lg font-semibold">
            Pending User Verification
          </h2>
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-gray-600">
              No users waiting for verification.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 text-left border">Name</th>
                    <th className="px-2 py-1 text-left border">Email</th>
                    <th className="px-2 py-1 text-left border">DOB</th>
                    <th className="px-2 py-1 text-left border">ID Type</th>
                    <th className="px-2 py-1 text-left border">ID Doc</th>
                    <th className="px-2 py-1 text-center border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((u) => {
                    const dob = u.dob
                      ? new Date(u.dob).toLocaleDateString()
                      : "-";
                    const docUrl = u.idDocPath
                      ? `${baseURL}/${u.idDocPath.replace(/\\/g, "/")}`
                      : null;
                    return (
                      <tr key={u._id}>
                        <td className="px-2 py-1 border">{u.name}</td>
                        <td className="px-2 py-1 border">{u.email}</td>
                        <td className="px-2 py-1 border">{dob}</td>
                        <td className="px-2 py-1 border">{u.idType || "-"}</td>
                       <td className="px-2 py-1 border">
  {u.idDocPath ? (
    <a
      href={`${API_BASE}${u.idDocPath}`}  // <-- important
      target="_blank"
      rel="noreferrer"
    >
      View ID
    </a>
  ) : (
    "No ID"
  )}
</td>

                        <td className="px-2 py-1 text-center border">
                          <button
                            onClick={() => handleVerifyUser(u._id, "approve")}
                            className="px-2 py-0.5 text-[11px] bg-green-600 text-white rounded mr-1"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerifyUser(u._id, "reject")}
                            className="px-2 py-0.5 text-[11px] bg-red-600 text-white rounded"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>


{/* Audit Logs */}
<div className="p-4 bg-white rounded shadow">
  <h2 className="mb-3 text-lg font-semibold">Audit Logs (Last 50)</h2>

  {logs.length === 0 ? (
    <p className="text-sm text-gray-600">No logs yet.</p>
  ) : (
    <div className="overflow-x-auto max-h-80">
      <table className="w-full text-xs border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-1 text-left border">Time</th>
            <th className="px-2 py-1 text-left border">User</th>
            <th className="px-2 py-1 text-left border">Action</th>
            <th className="px-2 py-1 text-left border">Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const ts = log.timestamp
              ? new Date(log.timestamp).toLocaleString()
              : "-";
            const userLabel = log.user
              ? `${log.user.name} (${log.user.email})`
              : "-";
            const detailsStr = log.details
              ? JSON.stringify(log.details)
              : "";

            return (
              <tr key={log._id}>
                <td className="px-2 py-1 border">{ts}</td>
                <td className="px-2 py-1 border">{userLabel}</td>
                <td className="px-2 py-1 border">{log.action}</td>
                <td className="px-2 py-1 text-gray-600 border">
                  {detailsStr.length > 80
                    ? detailsStr.slice(0, 80) + "..."
                    : detailsStr || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</div>

{/* Audit Logs */}
<div className="p-4 bg-white rounded shadow">
  <h2 className="mb-3 text-lg font-semibold">Audit Logs</h2>

  {/* Filters + Search */}
  <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-center md:justify-between">
    
    {/* Filter by action */}
    <select
      value={logFilter}
      onChange={(e) => setLogFilter(e.target.value)}
      className="px-2 py-1 text-sm border rounded"
    >
      <option value="all">All Actions</option>
      <option value="VOTE_CAST">Vote Cast</option>
      <option value="USER_REGISTERED">User Registered</option>
      <option value="USER_VERIFICATION">User Verification</option>
      <option value="PASSWORD_CHANGED">Password Changed</option>
      <option value="ACCOUNT_DELETED">Account Deleted</option>
      <option value="AVATAR_UPDATED">Avatar Updated</option>
      {/* Add more if your backend uses more actions */}
    </select>

    {/* Search bar */}
    <input
      type="text"
      placeholder="Search logs..."
      value={logSearch}
      onChange={(e) => setLogSearch(e.target.value)}
      className="w-full px-2 py-1 text-sm border rounded md:w-64"
    />
  </div>

  {/* Log table */}
  {filteredLogs.length === 0 ? (
    <p className="text-sm text-gray-600">No logs found.</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-1 text-left border">Action</th>
            <th className="px-2 py-1 text-left border">User</th>
            <th className="px-2 py-1 text-left border">Details</th>
            <th className="px-2 py-1 text-left border">Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log._id}>
              <td className="px-2 py-1 font-medium border">
                {log.action}
              </td>
              <td className="px-2 py-1 border">
                {log.user?.email || "Unknown"}
              </td>
              <td className="px-2 py-1 border text-[11px] text-gray-700">
                {log.details ? JSON.stringify(log.details) : "-"}
              </td>
              <td className="px-2 py-1 border">
                {log.timestamp ? new Date(log.timestamp).toLocaleString() : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>


        
      </div>
    </div>
  );
}
