// src/pages/ElectionDetail.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";

export default function ElectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voteLoading, setVoteLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [eRes] = await Promise.all([
          api.get(`/api/elections/${id}`)
        ]);
        setElection(eRes.data.election || null);
        setCandidates(eRes.data.candidates || []);
        // try to fetch current user (if logged)
        try {
          const me = await api.get("/api/auth/me");
          setCurrentUser(me.data.user || null);
        } catch (e) {
          setCurrentUser(null);
        }
        // if logged in, check vote status
        try {
          const vs = await api.get(`/api/elections/${id}/vote-status`);
          setHasVoted(vs.data.hasVoted || false);
        } catch (e) {
          setHasVoted(false);
        }
      } catch (err) {
        console.error(err);
        setMsg({ type: "error", text: err?.response?.data?.msg || err?.message });
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [id]);

  async function handleVote(candidateId) {
    if (!currentUser || currentUser.verificationStatus !== "approved") {
      setMsg({ type: "error", text: "Your account must be verified to vote. Ask an admin to verify you." });
      return;
    }
    if (hasVoted) {
      setMsg({ type: "error", text: "You have already voted in this election." });
      return;
    }
    if (!confirm("Are you sure you want to cast your vote for this candidate?")) return;

    setVoteLoading(true);
    setMsg(null);
    try {
      const res = await api.post(`/api/elections/${id}/vote`, { candidateId });
      setMsg({ type: "success", text: res.data.msg || "Vote cast" });
      // refresh candidates and status
      const updated = await api.get(`/api/elections/${id}`);
      setCandidates(updated.data.candidates || []);
      const vs = await api.get(`/api/elections/${id}/vote-status`);
      setHasVoted(vs.data.hasVoted || false);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const text = err?.response?.data?.msg || err?.message;
      if (status === 401) {
        setMsg({ type: "error", text: "Session expired. Please login again." });
        setTimeout(() => navigate("/login"), 1100);
      } else if (status === 403) {
        setMsg({ type: "error", text: text || "You are not allowed to vote." });
      } else {
        setMsg({ type: "error", text });
      }
    } finally {
      setVoteLoading(false);
    }
  }

  if (loading) return <div className="p-6">Loading election...</div>;
  if (!election) return <div className="p-6">Election not found.</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl p-6 mx-auto bg-white rounded shadow">
        <h1 className="mb-2 text-2xl font-semibold">{election.title}</h1>
        <p className="mb-4 text-sm text-gray-600">{election.description}</p>

        {msg && (
          <div className={`mb-4 p-3 rounded ${msg.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {msg.text}
          </div>
        )}

        <div className="grid gap-3">
          {candidates.map((c) => (
            <div key={c._id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-gray-600">{c.party}</div>
                <div className="mt-1 text-xs text-gray-500">{c.description}</div>
              </div>
              <div className="text-right">
                <div className="mb-2 text-sm">Votes: <span className="font-semibold">{c.votesCount || 0}</span></div>

                <button
                  onClick={() => handleVote(c._id)}
                  disabled={voteLoading || !currentUser || currentUser.verificationStatus !== "approved" || hasVoted}
                  className="px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
                >
                  {voteLoading ? "Voting..." : hasVoted ? "Already voted" : "Vote"}
                </button>

                {(!currentUser || currentUser.verificationStatus !== "approved") && (
                  <div className="mt-1 text-xs text-yellow-700">You must be verified to cast a vote.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
