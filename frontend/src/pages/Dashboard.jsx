// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    async function load() {
      setErr(null);
      try {
        const res = await api.get("/api/elections");
        setElections(res.data.elections || []);
      } catch (e) {
        console.error(e);
        setErr(e?.response?.data?.msg || e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-4 text-2xl font-semibold">Available Elections</h1>

        {loading && <div className="p-4">Loading elections...</div>}
        {err && <div className="p-3 mb-4 text-red-800 bg-red-100 rounded">{err}</div>}

        {!loading && elections.length === 0 && (
          <div className="p-4 bg-white rounded shadow">No elections found.</div>
        )}

        <div className="grid gap-4">
          {elections.map((el) => (
            <div key={el._id} className="flex items-center justify-between p-4 bg-white rounded shadow">
              <div>
                <h2 className="text-lg font-medium">{el.title}</h2>
                <p className="text-sm text-gray-600">{el.description}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {el.startTime ? `Start: ${new Date(el.startTime).toLocaleString()}` : ""}
                  {el.endTime ? ` • End: ${new Date(el.endTime).toLocaleString()}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/elections/${el._id}`}
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  View
                </Link>
                {el.isPublic ? (
                  <span className="self-center text-sm text-green-600">Public</span>
                ) : (
                  <span className="self-center text-sm text-gray-500">Private</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
