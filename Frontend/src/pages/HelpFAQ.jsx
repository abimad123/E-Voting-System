import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  HelpCircle, 
  ShieldCheck, 
  UserCheck, 
  EyeOff, 
  AlertTriangle, 
  FileText, 
  Lock,
  Info
} from "lucide-react";

export default function HelpFAQ() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] p-4 md:p-8 transition-colors duration-200 font-sans">
      {/* Container width set to 1400px */}
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="h-12 w-12 rounded-full bg-[#0B2447] dark:bg-yellow-400 flex items-center justify-center text-white dark:text-black shadow-lg">
                <HelpCircle size={24} />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & FAQ</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Guide to the Secure E-Voting System
                </p>
             </div>
          </div>
          
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#0B2447] bg-white border border-[#0B2447] rounded-lg hover:bg-[#0B2447] hover:text-white dark:bg-zinc-800 dark:text-yellow-400 dark:border-yellow-400 dark:hover:bg-yellow-400 dark:hover:text-black transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>

        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 overflow-hidden transition-colors duration-200">
           
           {/* Section 1: How to use */}
           <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-start gap-4">
                 <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <FileText size={20} />
                 </div>
                 <div className="space-y-3">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">1. How to use this E-Voting System?</h2>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                       <li className="flex items-start gap-2">
                          <span className="font-bold text-[#0B2447] dark:text-yellow-400 min-w-[60px]">Step 1:</span>
                          <span><strong className="text-gray-800 dark:text-gray-200">Register:</strong> Create an account with your name, email, password, and ID details.</span>
                       </li>
                       <li className="flex items-start gap-2">
                          <span className="font-bold text-[#0B2447] dark:text-yellow-400 min-w-[60px]">Step 2:</span>
                          <span><strong className="text-gray-800 dark:text-gray-200">KYC Verification:</strong> Upload your ID document. An admin will verify your details.</span>
                       </li>
                       <li className="flex items-start gap-2">
                          <span className="font-bold text-[#0B2447] dark:text-yellow-400 min-w-[60px]">Step 3:</span>
                          <span>
                            <strong className="text-gray-800 dark:text-gray-200">Wait for Approval:</strong> Your status will be <code className="bg-gray-100 dark:bg-zinc-700 px-1 py-0.5 rounded text-xs">pending</code> until reviewed. Once approved, it turns <span className="text-green-600 dark:text-green-400 font-bold">approved</span>.
                          </span>
                       </li>
                       <li className="flex items-start gap-2">
                          <span className="font-bold text-[#0B2447] dark:text-yellow-400 min-w-[60px]">Step 4:</span>
                          <span><strong className="text-gray-800 dark:text-gray-200">Vote:</strong> Once verified and while the election is active, you can cast exactly <strong>one vote per election</strong>.</span>
                       </li>
                    </ul>
                 </div>
              </div>
           </div>

           {/* Section 2: KYC */}
           <div className="p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#1f1f1f]">
              <div className="flex items-start gap-4">
                 <div className="mt-1 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                    <ShieldCheck size={20} />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">2. Why do we need KYC / ID verification?</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                       This project focuses on <span className="font-semibold text-gray-900 dark:text-white">secure, fair elections</span>. KYC (Know Your Customer) verification helps us:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400 marker:text-gray-400">
                       <li>Prevent fake or duplicate accounts voting.</li>
                       <li>Ensure each real student/citizen gets exactly one vote.</li>
                       <li>Allow admins to audit suspicious activity if needed.</li>
                    </ul>
                    <div className="mt-2 text-xs bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 p-3 rounded text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                       <Info size={14} className="mt-0.5 flex-shrink-0" />
                       <p>Your actual ID number is not stored directly – only a <strong>secure hash</strong> is stored in the database for uniqueness checking.</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Section 3: Verification */}
           <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-start gap-4">
                 <div className="mt-1 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                    <UserCheck size={20} />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">3. Who verifies my account?</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                       Only users with <span className="font-semibold">admin role</span> (e.g., faculty or organizers) can:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400 marker:text-gray-400">
                       <li>View your uploaded ID document.</li>
                       <li>Approve or reject your account.</li>
                       <li>See system audit logs for security.</li>
                    </ul>
                    <p className="text-sm italic text-gray-500 dark:text-gray-500 mt-2">
                       Note: Normal voters cannot see other people's IDs or personal details.
                    </p>
                 </div>
              </div>
           </div>

           {/* Section 4: Live Counts */}
           <div className="p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#1f1f1f]">
              <div className="flex items-start gap-4">
                 <div className="mt-1 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                    <EyeOff size={20} />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">4. Why can’t I see live vote counts?</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                       To keep the election <strong>fair</strong> and avoid bias:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400 marker:text-gray-400">
                       <li>While the election is <strong>active</strong>, voters <strong>cannot see</strong> the number of votes.</li>
                       <li>After the election <strong>ends</strong>, the results page becomes available with total counts and winners.</li>
                    </ul>
                 </div>
              </div>
           </div>

           {/* Section 5 & 6: Limits & Security */}
           <div className="p-6 border-b border-gray-100 dark:border-zinc-800 grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <div className="flex items-center gap-2 mb-2">
                    <Lock size={18} className="text-gray-400" />
                    <h2 className="font-bold text-gray-800 dark:text-white">5. Vote Limits</h2>
                 </div>
                 <p className="text-sm text-gray-600 dark:text-gray-400">
                    You can vote <strong>only once</strong> per election. If you try again, the system will block it. This is enforced by strict database rules.
                 </p>
              </div>
              <div className="space-y-2">
                 <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={18} className="text-gray-400" />
                    <h2 className="font-bold text-gray-800 dark:text-white">6. Security</h2>
                 </div>
                 <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400 marker:text-gray-400">
                    <li>Passwords stored as <strong>bcrypt hashes</strong>.</li>
                    <li>API requests secured with <strong>JWT tokens</strong>.</li>
                    <li>Full audit logging for admin review.</li>
                 </ul>
              </div>
           </div>

           {/* Section 7: Troubleshooting */}
           <div className="p-6 bg-red-50 dark:bg-red-900/10">
              <div className="flex items-start gap-4">
                 <div className="mt-1 p-2 bg-white dark:bg-red-900/20 rounded-lg text-red-500">
                    <AlertTriangle size={20} />
                 </div>
                 <div className="space-y-3">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">7. Troubleshooting</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                       <div className="bg-white dark:bg-[#111] p-3 rounded border border-red-100 dark:border-red-900/30">
                          <p className="font-semibold text-red-600 dark:text-red-400 text-xs uppercase mb-1">Problem: I can't vote</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Check if your status is <code>approved</code>. If pending, please wait for verification.</p>
                       </div>
                       <div className="bg-white dark:bg-[#111] p-3 rounded border border-red-100 dark:border-red-900/30">
                          <p className="font-semibold text-red-600 dark:text-red-400 text-xs uppercase mb-1">Problem: "Ended" Button</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">The election time is over. You can only view results now.</p>
                       </div>
                       <div className="bg-white dark:bg-[#111] p-3 rounded border border-red-100 dark:border-red-900/30">
                          <p className="font-semibold text-red-600 dark:text-red-400 text-xs uppercase mb-1">Problem: "Already Voted"</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">You have already cast your vote for this election.</p>
                       </div>
                       <div className="bg-white dark:bg-[#111] p-3 rounded border border-red-100 dark:border-red-900/30">
                          <p className="font-semibold text-red-600 dark:text-red-400 text-xs uppercase mb-1">Problem: Logged Out</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Your session expired. Please log in again.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}