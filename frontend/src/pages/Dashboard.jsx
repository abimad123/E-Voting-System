// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

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

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  const now = new Date();

  const getStatus = (e) => {
    const start = e.startTime ? new Date(e.startTime) : null;
    const end = e.endTime ? new Date(e.endTime) : null;

    if (end && now > end) return "completed";
    if (start && now < start) return "upcoming";
    return "active";
  };

  return (
  <div className="min-h-screen bg-gray-50">
   
    <div className="max-w-5xl p-6 pt-20 mx-auto space-y-6">

        {/* user info */}
       <div className="flex items-center justify-between p-4 bg-white rounded shadow">
  <div>
    <h1 className="text-xl font-semibold">
      Welcome, {user?.name || "Voter"}
    </h1>
    <p className="text-sm text-gray-600">{user?.email}</p>
    <p className="mt-1 text-xs">
      Status:{" "}
      <span
        className={
          user?.verificationStatus === "approved"
            ? "text-green-600 font-medium"
            : user?.verificationStatus === "rejected"
            ? "text-red-600 font-medium"
            : "text-yellow-600 font-medium"
        }
      >
        {user?.verificationStatus || "pending"}
      </span>
    </p>
  </div>


</div>
{/* inside the top card in Dashboard, under user info */}
{user?.role === "admin" && (
  <button
    onClick={() => navigate("/admin")}
    className="px-3 py-1 mt-2 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
  >
    Go to Admin Panel
  </button>
)}



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

        {/* elections list */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-3 text-lg font-semibold">Elections</h2>

          {elections.length === 0 ? (
            <p className="text-sm text-gray-600">No elections available.</p>
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

                return (
                  <div
                    key={e._id}
                    className="flex items-center justify-between px-3 py-2 border rounded"
                  >
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

                    <div className="flex gap-2">
                      {/* open election */}
                      <Link
                        to={`/elections/${e._id}`}
                        className="px-3 py-1 text-xs border rounded hover:bg-gray-100"
                      >
                        Open
                      </Link>

                      {/* results: only for completed elections */}
                      {status === "completed" && (
                        <Link
                          to={`/elections/${e._id}/results`}
                          className="px-3 py-1 text-xs text-blue-600 border border-blue-400 rounded hover:bg-blue-50"
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
  <div className="flex flex-col min-h-screen bg-gray-50">

    <div className="flex-1 max-w-5xl p-6 pt-20 mx-auto">
      {/* page content here */}
    </div>
   
  </div>
</div>


  );
}
