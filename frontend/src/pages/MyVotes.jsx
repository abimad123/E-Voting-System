// src/pages/MyVotes.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function MyVotes() {
  const navigate = useNavigate();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        // ensure logged in
        await api.get("/api/auth/me");

        const res = await api.get("/api/votes/my");
        setVotes(res.data.votes || []);
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

  if (loading) return <div className="p-6">Loading your votes...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl p-6 mx-auto bg-white rounded shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">My Voting History</h1>
            <p className="text-sm text-gray-600">
              All elections where you have cast a vote.
            </p>
          </div>
          <Link
            to="/profile"
            className="text-sm text-blue-600 hover:underline"
          >
            ⬅ Back to Profile
          </Link>
        </div>

        {msg && (
          <div
            className={`mb-3 p-3 rounded ${
              msg.type === "error"
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {msg.text}
          </div>
        )}

        {votes.length === 0 ? (
          <p className="text-sm text-gray-600">
            You haven&apos;t voted in any elections yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left border">Election</th>
                  <th className="px-3 py-2 text-left border">Candidate</th>
                  <th className="px-3 py-2 text-left border">Party</th>
                  <th className="px-3 py-2 text-left border">Voted At</th>
                  <th className="px-3 py-2 text-center border">Details</th>
                </tr>
              </thead>
              <tbody>
                {votes.map((v) => {
                  const election = v.election || {};
                  const candidate = v.candidate || {};
                  const votedAt = v.createdAt
                    ? new Date(v.createdAt).toLocaleString()
                    : new Date(
                        parseInt(v._id.substring(0, 8), 16) * 1000
                      ).toLocaleString(); // fallback from ObjectId

                  return (
                    <tr key={v._id}>
                      <td className="px-3 py-2 border">
                        {election.title || "—"}
                      </td>
                      <td className="px-3 py-2 border">
                        {candidate.name || "—"}
                      </td>
                      <td className="px-3 py-2 border">
                        {candidate.party || "—"}
                      </td>
                      <td className="px-3 py-2 border">{votedAt}</td>
                      <td className="px-3 py-2 text-center border">
                        {election._id ? (
                          <Link
                            to={`/elections/${election._id}/results`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View Results
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
