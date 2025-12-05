import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { 
  ArrowLeft, 
  Trophy, 
  AlertCircle, 
  User, 
  CheckCircle,
  Loader2,
  Calendar,
  Vote,
  BarChart2
} from "lucide-react";

export default function ElectionResults() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center">
       <div className="flex items-center gap-2 text-[#0B2447] dark:text-yellow-400 font-semibold animate-pulse">
         <Loader2 className="animate-spin" /> Loading results...
       </div>
    </div>
  );

  if (!election) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center text-gray-500">
      Election not found.
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] p-4 md:p-8 transition-colors duration-200 font-sans">
      {/* Container Width: 1400px */}
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* --- UNIFIED HEADER CARD (MATCHING ELECTION DETAIL) --- */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border-l-4 border-[#0B2447] dark:border-yellow-400 p-6 transition-colors duration-200">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            
            {/* Left Side: Title & Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {election.title}
                 </h1>
                 <span className="px-3 py-1 text-xs font-bold uppercase rounded-full border bg-gray-100 text-gray-600 border-gray-300 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700">
                    Results
                 </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
                {election.description}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                 <div className="flex items-center gap-1">
                     <Vote size={14} className="text-[#0B2447] dark:text-yellow-400" />
                     <span>Total Votes: <span className="font-bold text-gray-800 dark:text-gray-200">{totalVotes}</span></span>
                 </div>
                 {election.endTime && (
                   <div className="flex items-center gap-1">
                     <Calendar size={14} />
                     <span>Ended: <span className="font-medium text-gray-800 dark:text-gray-200">{new Date(election.endTime).toLocaleString()}</span></span>
                   </div>
                 )}
              </div>
            </div>

            {/* Right Side: Back Button */}
            <div className="flex flex-col gap-2 min-w-[140px]">
               <button
                  onClick={() => navigate(`/elections/${id}`)}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-700 transition-all shadow-sm"
               >
                  <ArrowLeft size={16} />
                  Back to Details
               </button>
            </div>
          </div>
        </div>

        {/* --- MESSAGES --- */}
        {msg && (
           <div className={`p-4 rounded-lg flex items-center gap-2 border-l-4 shadow-sm ${
               msg.type === "success"
               ? "bg-green-50 text-green-800 border-green-500 dark:bg-green-900/20 dark:text-green-400"
               : "bg-red-50 text-red-800 border-red-500 dark:bg-red-900/20 dark:text-red-400"
           }`}>
             <AlertCircle size={20}/>
             {msg.text}
           </div>
        )}

        {/* --- RESULTS TABLE CARD --- */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 overflow-hidden transition-colors duration-200">
           <div className="p-4 bg-gray-50 dark:bg-[#222] border-b border-gray-100 dark:border-zinc-700">
              <h2 className="text-lg font-bold text-[#0B2447] dark:text-yellow-400 flex items-center gap-2">
                 <BarChart2 size={20} />
                 Vote Count
              </h2>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-sm">
                 <thead className="bg-gray-50 dark:bg-[#222] border-b border-gray-200 dark:border-zinc-700">
                    <tr>
                       <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300">Candidate</th>
                       <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300">Party</th>
                       <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell">Description</th>
                       <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300">Votes</th>
                       <th className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {candidates.map((c) => {
                       const isWinner = winners.includes(c._id);
                       return (
                          <tr 
                             key={c._id} 
                             className={`hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors ${
                                isWinner ? "bg-green-50/50 dark:bg-green-900/10" : ""
                             }`}
                          >
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                      isWinner 
                                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400"
                                      : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400"
                                   }`}>
                                      {isWinner ? <Trophy size={14} /> : <User size={14} />}
                                   </div>
                                   <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-300">
                                   {c.party}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-gray-500 dark:text-gray-400 hidden md:table-cell max-w-xs truncate">
                                {c.description || "-"}
                             </td>
                             <td className="px-6 py-4 text-right">
                                <span className="font-bold text-gray-900 dark:text-white text-base">
                                   {c.votesCount || 0}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-center">
                                {isWinner && totalVotes > 0 ? (
                                   <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800">
                                      <CheckCircle size={12} />
                                      Winner
                                   </span>
                                ) : (
                                   <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
                                )}
                             </td>
                          </tr>
                       );
                    })}
                    {candidates.length === 0 && (
                       <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                             No candidates found for this election.
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}