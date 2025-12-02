// src/pages/ElectionDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function ElectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [canVote, setCanVote] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);


  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // election + candidates
        const res = await api.get(`/api/elections/${id}`);
        setElection(res.data.election);
        setCandidates(res.data.candidates || []);

        // vote status & verification status
      const [voteRes, meRes] = await Promise.all([
  api.get(`/api/elections/${id}/vote-status`),
  api.get("/api/auth/me"),
]);

setHasVoted(!!voteRes.data.hasVoted);
setCanVote(meRes.data.user.verificationStatus === "approved");
setCurrentUser(meRes.data.user);

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
  }, [id, navigate]);

  const handleVote = async (candidateId) => {
    setMsg(null);
    try {
      const res = await api.post(`/api/elections/${id}/vote`, { candidateId });
      setMsg({ type: "success", text: res.data.msg || "Vote cast successfully" });
      setHasVoted(true);

      // refresh candidates so votesCount updates
      const detailRes = await api.get(`/api/elections/${id}`);
      setCandidates(detailRes.data.candidates || []);
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    }
  };

  if (loading) return <div className="p-6">Loading election...</div>;
  if (!election) return <div className="p-6">Election not found.</div>;

  const now = new Date();
  const start = election.startTime ? new Date(election.startTime) : null;
  const end = election.endTime ? new Date(election.endTime) : null;

  const isCompleted = end && now > end;
  const isNotStarted = start && now < start;
  const isActive = !isCompleted && !isNotStarted;
  const canSeeVotes =
  isCompleted || (currentUser && currentUser.role === "admin");


  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl p-6 mx-auto space-y-4 bg-white rounded shadow">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{election.title}</h1>
            <p className="mb-1 text-sm text-gray-600">
              {election.description}
            </p>
            <p className="text-xs text-gray-500">
              {start && <>Start: {start.toLocaleString()} | </>}
              {end && <>End: {end.toLocaleString()}</>}
            </p>
            <p className="mt-1 text-xs">
              Status:{" "}
              <span
                className={
                  isCompleted
                    ? "text-gray-700 font-semibold"
                    : isActive
                    ? "text-green-600 font-semibold"
                    : "text-yellow-600 font-semibold"
                }
              >
                {isCompleted
                  ? "Completed"
                  : isActive
                  ? "Active"
                  : "Upcoming"}
              </span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Link
              to="/dashboard"
              className="text-xs text-blue-600 hover:underline"
            >
              ⬅ Back to dashboard
            </Link>

            {/* Results link only if election is completed */}
            {isCompleted && (
              <Link
                to={`/elections/${id}/results`}
                className="px-3 py-1 text-xs text-blue-600 border border-blue-400 rounded hover:bg-blue-50"
              >
                View Results
              </Link>
            )}
          </div>
        </div>

        {msg && (
          <div
            className={`p-3 rounded ${
              msg.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {msg.text}
          </div>
        )}

        {!canVote && (
          <div className="p-3 mb-2 text-sm text-yellow-800 rounded bg-yellow-50">
            You must be <span className="font-semibold">verified</span> to cast
            a vote.
          </div>
        )}

        {isNotStarted && (
          <div className="p-3 mb-2 text-sm text-blue-800 rounded bg-blue-50">
            This election has not started yet.
          </div>
        )}

        {isCompleted && (
          <div className="p-3 mb-2 text-sm text-gray-700 rounded bg-gray-50">
            This election has ended. You can view the final results above.
          </div>
        )}

        <div className="border rounded">
          {candidates.map((c) => (
            <div
              key={c._id}
              className="flex items-center justify-between px-4 py-3 border-b last:border-b-0"
            >
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-600">{c.party}</div>
                <div className="text-xs text-gray-500">{c.description}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600">
  Votes:{" "}
  <span className="font-semibold">
    {canSeeVotes ? (c.votesCount || 0) : "Hidden until results are published"}
  </span>
</span>

                <button
                  className={`px-3 py-1 text-xs rounded border ${
                    !canVote || isCompleted || isNotStarted || hasVoted
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  disabled={
                    !canVote || isCompleted || isNotStarted || hasVoted
                  }
                  onClick={() => handleVote(c._id)}
                >
                  {!canVote
                    ? "Not verified"
                    : isNotStarted
                    ? "Not started"
                    : isCompleted
                    ? "Ended"
                    : hasVoted
                    ? "Already voted"
                    : "Vote"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
