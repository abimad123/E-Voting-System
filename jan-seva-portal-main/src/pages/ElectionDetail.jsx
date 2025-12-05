import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Vote, 
  BarChart2, 
  User, 
  Loader2,
  Info
} from "lucide-react";

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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center">
       <div className="flex items-center gap-2 text-[#0B2447] dark:text-yellow-400 font-semibold animate-pulse">
         <Loader2 className="animate-spin" /> Loading election data...
       </div>
    </div>
  );

  if (!election) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] p-6 text-center text-gray-500">
      Election not found.
    </div>
  );

  const now = new Date();
  const start = election.startTime ? new Date(election.startTime) : null;
  const end = election.endTime ? new Date(election.endTime) : null;

  const isCompleted = end && now > end;
  const isNotStarted = start && now < start;
  const isActive = !isCompleted && !isNotStarted;
  
  // Logic to determine if vote counts should be shown
  const canSeeVotes = isCompleted || (currentUser && currentUser.role === "admin");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] p-4 md:p-8 transition-colors duration-200 font-sans">
      {/* Container Width: 1400px */}
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* --- HEADER SECTION --- */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border-l-4 border-[#0B2447] dark:border-yellow-400 p-6 transition-colors duration-200">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {election.title}
                 </h1>
                 <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${
                    isCompleted
                      ? "bg-gray-100 text-gray-600 border-gray-300 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700"
                      : isActive
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
                 }`}>
                    {isCompleted ? "Completed" : isActive ? "Active" : "Upcoming"}
                 </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
                {election.description}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                 {start && (
                   <div className="flex items-center gap-1">
                     <Calendar size={14} />
                     <span>Start: <span className="font-medium text-gray-800 dark:text-gray-200">{start.toLocaleString()}</span></span>
                   </div>
                 )}
                 {end && (
                   <div className="flex items-center gap-1">
                     <Clock size={14} />
                     <span>End: <span className="font-medium text-gray-800 dark:text-gray-200">{end.toLocaleString()}</span></span>
                   </div>
                 )}
              </div>
            </div>

            <div className="flex flex-col gap-2 min-w-[140px]">
               <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-700 transition-all shadow-sm"
               >
                  <ArrowLeft size={16} />
                  Dashboard
               </button>

               {isCompleted && (
                 <Link
                   to={`/elections/${id}/results`}
                   className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0B2447] hover:bg-[#1a3a5e] dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300 rounded-lg shadow-sm transition-colors"
                 >
                   <BarChart2 size={16} />
                   View Results
                 </Link>
               )}
            </div>
          </div>
        </div>

        {/* --- MESSAGES & ALERTS --- */}
        <div className="space-y-4">
            {msg && (
              <div className={`p-4 rounded-lg flex items-center gap-2 border-l-4 shadow-sm ${
                  msg.type === "success"
                    ? "bg-green-50 text-green-800 border-green-500 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-800 border-red-500 dark:bg-red-900/20 dark:text-red-400"
                }`}>
                {msg.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
                {msg.text}
              </div>
            )}

            {!canVote && (
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-900/30 flex items-center gap-2">
                 <AlertCircle size={20} />
                 <span>You must be <span className="font-bold underline">verified</span> to cast a vote. Please complete KYC in your profile.</span>
              </div>
            )}

            {isNotStarted && (
               <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-900/30 flex items-center gap-2">
                 <Info size={20} />
                 This election has not started yet. Voting lines will open soon.
               </div>
            )}

            {isCompleted && (
               <div className="p-4 rounded-lg bg-gray-100 dark:bg-zinc-800/50 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 flex items-center gap-2">
                 <Info size={20} />
                 This election has ended. You can view the final results above.
               </div>
            )}
        </div>

        {/* --- CANDIDATES LIST --- */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 overflow-hidden transition-colors duration-200">
           <div className="p-4 bg-gray-50 dark:bg-[#222] border-b border-gray-100 dark:border-zinc-700">
              <h2 className="text-lg font-bold text-[#0B2447] dark:text-yellow-400 flex items-center gap-2">
                 <Vote size={20} />
                 Candidates Ballot
              </h2>
           </div>

           <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              {candidates.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No candidates listed for this election yet.
                  </div>
              ) : (
                  candidates.map((c) => (
                    <div key={c._id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                        <div className="flex items-start gap-4">
                           <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0">
                              <User size={24} />
                           </div>
                           <div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{c.name}</h3>
                              <p className="text-sm font-semibold text-[#0B2447] dark:text-yellow-400 mb-1">{c.party}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                                {c.description || "No manifesto provided."}
                              </p>
                              
                              {/* Live Vote Count (Conditional) */}
                              <div className="mt-2 text-xs font-mono text-gray-500 dark:text-gray-500 flex items-center gap-2">
                                <BarChart2 size={12} />
                                Votes: 
                                <span className="font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                   {canSeeVotes ? (c.votesCount || 0) : "Hidden"}
                                </span>
                                {!canSeeVotes && <span className="italic">(Hidden until results published)</span>}
                              </div>
                           </div>
                        </div>

                        <div className="flex-shrink-0">
                           <button
                              disabled={!canVote || isCompleted || isNotStarted || hasVoted}
                              onClick={() => handleVote(c._id)}
                              className={`w-full md:w-auto px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2
                                ${
                                  !canVote || isCompleted || isNotStarted || hasVoted
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 dark:bg-zinc-800 dark:text-zinc-600 dark:border-zinc-700"
                                    : "bg-[#0B2447] text-white hover:bg-[#1a3a5e] dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300"
                                }
                              `}
                           >
                              {hasVoted ? <CheckCircle size={16}/> : <Vote size={16}/>}
                              {!canVote
                                ? "Verify to Vote"
                                : isNotStarted
                                ? "Not Started"
                                : isCompleted
                                ? "Ended"
                                : hasVoted
                                ? "Voted"
                                : "Vote Now"}
                           </button>
                        </div>
                    </div>
                  ))
              )}
           </div>
        </div>

      </div>
    </div>
  );
}