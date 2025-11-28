// src/pages/ElectionResults.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function ElectionResults() {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/api/elections/${id}/results`);
        setElection(res.data.election || null);
        setCandidates(res.data.candidates || []);
        setTotalVotes(res.data.totalVotes || 0);
        setWinners(res.data.winners || []);
      } catch (err) {
        console.error(err);
        setMsg({
          type: "error",
          text: err?.response?.data?.msg || err?.message,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="p-6">Loading results...</div>;
  if (!election) return <div className="p-6">Election not found.</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl p-6 mx-auto bg-white rounded shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {election.title} – Results
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {election.description}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Total Votes Cast: <span className="font-semibold">{totalVotes}</span>
            </p>
          </div>
          <Link
            to={`/elections/${id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            ⬅ Back to election
          </Link>
        </div>

        {msg && (
          <div
            className={`mb-4 p-3 rounded ${
              msg.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {msg.text}
          </div>
        )}

        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left border">Candidate</th>
              <th className="px-3 py-2 text-left border">Party</th>
              <th className="px-3 py-2 text-left border">Description</th>
              <th className="px-3 py-2 text-right border">Votes</th>
              <th className="px-3 py-2 text-center border">Status</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => {
              const isWinner = winners.includes(c._id);
              return (
                <tr
                  key={c._id}
                  className={isWinner ? "bg-green-50 font-medium" : ""}
                >
                  <td className="px-3 py-2 border">{c.name}</td>
                  <td className="px-3 py-2 border">{c.party}</td>
                  <td className="px-3 py-2 text-gray-600 border">
                    {c.description}
                  </td>
                  <td className="px-3 py-2 text-right border">
                    {c.votesCount || 0}
                  </td>
                  <td className="px-3 py-2 text-center border">
                    {isWinner && totalVotes > 0 ? (
                      <span className="inline-block px-2 py-1 text-xs text-white bg-green-600 rounded">
                        Winner
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
