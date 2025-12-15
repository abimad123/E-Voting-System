import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, CheckCircle2, AlertCircle, 
  Vote, BarChart2, User, Loader2, Share2, ExternalLink,
  ShieldCheck, Check, Shield
} from 'lucide-react';

export default function ElectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState(null); 
  const [canVote, setCanVote] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votingFor, setVotingFor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/api/elections/${id}`);
        setElection(res.data.election);
        setCandidates(res.data.candidates || []);

        const [voteRes, meRes] = await Promise.all([
          api.get(`/api/elections/${id}/vote-status`),
          api.get("/api/auth/me"),
        ]);

        console.log("Vote Status Response:", voteRes.data);

        setHasVoted(!!voteRes.data.hasVoted);
        
        const serverData = voteRes.data;
        const recoveredId = serverData.candidateId || 
                            serverData.votedCandidateId || 
                            serverData.vote?.candidateId || 
                            serverData.vote?.candidate;

        if (serverData.hasVoted && recoveredId) {
            setVotedCandidateId(recoveredId);
        }

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

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  const handleVote = async (candidateId) => {
    // 1. Guard Clause for Admin
    if (isAdmin) {
        setMsg({ type: "error", text: "Administrators are not allowed to cast votes." });
        return;
    }

    setMsg(null);
    setVotingFor(candidateId);
    
    try {
      const res = await api.post(`/api/elections/${id}/vote`, { candidateId });
      setMsg({ type: "success", text: res.data.msg || "Vote cast successfully" });
      
      setHasVoted(true);
      setVotedCandidateId(candidateId);

      const detailRes = await api.get(`/api/elections/${id}`);
      setCandidates(detailRes.data.candidates || []);
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    } finally {
      setVotingFor(null);
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
  
  const canSeeVotes = isCompleted || isAdmin;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] pb-20 transition-colors duration-500 font-sans">
      

     <div className="container mx-auto px-4 max-w-[1400px] mt-8">
        
        {/* --- Hero Section --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm relative overflow-hidden mb-12"
        >
          <div className={`absolute top-0 left-0 bottom-0 w-2 ${
            isActive ? 'bg-gradient-to-b from-green-400 to-green-600' : isCompleted ? 'bg-gray-500' : 'bg-blue-500'
          }`}></div>

          <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row">
            <div className="max-w-2xl space-y-6">
              <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border flex items-center gap-2 w-fit ${
                        isActive
                          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                          : isCompleted
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                          : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                     }`}>
                        {isActive && <span className="relative flex w-2 h-2">
                          <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"></span>
                          <span className="relative inline-flex w-2 h-2 bg-green-500 rounded-full"></span>
                        </span>}
                        {isCompleted ? "Completed" : isActive ? "Active" : "Upcoming"}
                     </span>
                     <span className="text-xs font-medium text-gray-400">ID: {election._id.slice(-6).toUpperCase()}</span>
                  </div>
                  
                  <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900 md:text-5xl dark:text-white">
                    {election.title}
                  </h1>
              </div>
              
              <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                {election.description}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                  {start && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#222] px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="p-2 bg-white rounded-lg shadow-sm dark:bg-black">
                       <Calendar size={16} className="text-gray-500" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">Starts</p>
                       <p className="font-semibold">{start.toLocaleString()}</p>
                    </div>
                  </div>
                  )}
                  {end && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#222] px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="p-2 bg-white rounded-lg shadow-sm dark:bg-black">
                       <Clock size={16} className="text-gray-500" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">Ends</p>
                       <p className="font-semibold">{end.toLocaleString()}</p>
                    </div>
                  </div>
                  )}
              </div>
            </div>
            
            <div className="flex-col items-end justify-center hidden md:flex">
              <div className="flex items-center justify-center w-24 h-24 transition-transform transform shadow-lg bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl rotate-3 hover:rotate-6">
                <Vote size={40} className="text-white" />
              </div>
              <p className="mt-4 text-xs font-bold tracking-widest text-gray-400 uppercase">Official Ballot</p>
            </div>
          </div>
        </motion.div>

        {/* --- Messages --- */}
        <AnimatePresence>
          {msg && (
             <motion.div 
               initial={{ opacity: 0, height: 0, marginBottom: 0 }}
               animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
               className={`p-4 rounded-xl flex items-center gap-3 border-l-4 shadow-sm mb-6 ${
                 msg.type === "success" 
                   ? "bg-green-50 text-green-800 border-green-500 dark:bg-green-900/20 dark:text-green-400" 
                   : "bg-red-50 text-red-800 border-red-500 dark:bg-red-900/20 dark:text-red-400"
               }`}
             >
                {msg.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                {msg.text}
             </motion.div>
          )}
          
          {isAdmin && (
             <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-3 p-4 mb-8 text-blue-800 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/10 dark:text-blue-200 dark:border-blue-900/30">
                <Shield size={20} />
                <span><strong>Admin Mode:</strong> You are viewing this election as an administrator. Voting is disabled for your account.</span>
             </motion.div>
          )}

          {!canVote && !isAdmin && (
             <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-2 p-4 mb-8 text-yellow-800 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 dark:text-yellow-200 dark:border-yellow-900/30">
                <AlertCircle size={20} />
                <span>You must be <span className="font-bold underline">verified</span> to cast a vote. Please complete KYC in your profile.</span>
             </motion.div>
          )}
        </AnimatePresence>

    {/* --- Candidates Grid --- */}
        <div className="space-y-6">
          <div className="flex items-end justify-between px-2">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-900 text-white dark:bg-yellow-500 dark:text-black rounded-xl shadow-sm">
                   <User size={20} />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-gray-900 dark:text-white">Candidates</h2>
                   <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Select one candidate to cast your vote</p>
                </div>
             </div>
             <div className="hidden px-3 py-1 text-xs font-bold tracking-widest text-gray-400 uppercase border border-gray-200 rounded-full md:block dark:border-zinc-800">
                {candidates.length} Qualified Candidates
             </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
            {candidates.length === 0 ? (
                <div className="col-span-full py-16 px-6 text-center bg-white dark:bg-[#1a1a1a] rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-4">
                   <div className="p-4 text-gray-400 rounded-full bg-gray-50 dark:bg-zinc-800">
                      <User size={32} />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Candidates Yet</h3>
                      <p className="max-w-sm mx-auto text-gray-500 dark:text-gray-400">This election has just been created. Candidates will appear here once registered.</p>
                   </div>
                </div>
            ) : (
                candidates.map((candidate, index) => {
                  const isSelected = votedCandidateId === candidate._id; 
                  const isVoting = votingFor === candidate._id;
                  
                  // Disable if: Not Active OR User already voted (unless it's the one they voted for) OR User unverified OR Admin
                  const isDisabled = !isActive || (!canVote) || (hasVoted && !isSelected) || isAdmin;

                  return (
                    <motion.div
                      key={candidate._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      // 👇 THIS IS THE UPDATED LINE 👇
                      className={`group relative flex flex-col overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
                         isSelected
                           ? "bg-green-50/50 dark:bg-[#1a1a1a] border-green-500 dark:border-green-500 shadow-xl shadow-green-500/10 scale-[1.02]"
                           : "bg-white dark:bg-[#151515] border-gray-200 dark:border-zinc-800 shadow-sm dark:shadow-none hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-none hover:-translate-y-1"
                      }`}
                    >
                       <div className="relative z-10 flex flex-col flex-1 p-8">
                          <div className="flex items-start justify-between mb-6">
                             {/* Avatar */}
                             <div className="relative w-20 h-20 rounded-2xl bg-gray-50 dark:bg-[#222] p-1.5 shadow-sm border border-gray-100 dark:border-zinc-800">
                                <div className="w-full h-full bg-white dark:bg-[#1a1a1a] rounded-xl flex items-center justify-center overflow-hidden">
                                   {candidate.iconUrl ? (
                                     <img src={`${API_BASE}${candidate.iconUrl}`} alt={candidate.name} className="object-cover w-full h-full" />
                                   ) : (
                                     <User size={32} className="text-gray-300 dark:text-gray-500" />
                                   )}
                                </div>
                                {isSelected && (
                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-[#151515]">
                                        <ShieldCheck size={14} fill="currentColor" />
                                    </div>
                                )}
                             </div>

                             {/* Party Badge */}
                             <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                 isSelected 
                                   ? 'bg-green-100 text-green-700 border-green-200' 
                                   : 'bg-gray-50 dark:bg-black border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400'
                             }`}>
                                {candidate.party}
                             </div>
                          </div>

                          <div className="space-y-3">
                             <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-[#0B2447] dark:group-hover:text-yellow-400 transition-colors">
                                {candidate.name}
                             </h3>
                             <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3">
                                {candidate.description || "No manifesto provided for this candidate."}
                             </p>
                             
                             <button className="flex items-center gap-1.5 text-xs font-bold text-[#0B2447] dark:text-white hover:underline underline-offset-4 decoration-2 decoration-yellow-500 transition-all pt-1">
                                Read Full Manifesto <ExternalLink size={12} className="text-yellow-500" />
                             </button>
                          </div>

                          {/* Vote Count (Only if allowed) */}
                          {canSeeVotes && (
                              <div className="flex items-center gap-3 pt-6 mt-auto">
                                <div className="flex-1 h-px bg-gray-100 dark:bg-zinc-800"></div>
                                <div className="flex items-center gap-2 font-mono text-xs font-bold text-gray-500 dark:text-gray-400">
                                  <BarChart2 size={14} />
                                  <span>{candidate.votesCount || 0} Votes</span>
                                </div>
                              </div>
                          )}
                       </div>

                       {/* Footer Action Area */}
                       <div className={`p-4 border-t ${
                          isSelected 
                            ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' 
                            : 'bg-gray-50/80 dark:bg-[#1a1a1a] border-gray-100 dark:border-zinc-800'
                       }`}>
                          {isSelected ? (
                              <div className="w-full py-3.5 rounded-xl bg-green-500 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                                 <Check size={18} strokeWidth={3} /> Voted Successfully
                              </div>
                          ) : (
                              <button
                                 onClick={() => handleVote(candidate._id)}
                                 disabled={isDisabled}
                                 className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
                                    isDisabled 
                                       ? "bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed border border-transparent"
                                       : "bg-[#0B2447] text-white hover:bg-[#1a3a5e] dark:bg-white dark:text-black dark:hover:bg-gray-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                                 }`}
                              >
                                 {isVoting ? (
                                    <>
                                       <Loader2 size={16} className="animate-spin" /> Confirming...
                                    </>
                                 ) : (
                                    <>
                                       {isAdmin ? (
                                          <span className="flex items-center gap-2 opacity-70"><Shield size={14}/> Admin View Only</span>
                                       ) : hasVoted ? (
                                          "Unavailable"
                                       ) : isActive ? (
                                          `Vote for ${candidate.name.split(' ')[0]}`
                                       ) : (
                                          "Election Closed"
                                       )}
                                    </>
                                 )}
                              </button>
                          )}
                       </div>
                    </motion.div>
                  );
                })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}