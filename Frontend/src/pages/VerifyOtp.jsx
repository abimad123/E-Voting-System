import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  Mail, 
  ArrowRight, 
  Loader2, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

export default function VerifyOtp() {
  const loc = useLocation();
  const identifierFromState = loc.state?.identifier || '';
  const [identifier, setIdentifier] = useState(identifierFromState);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      await api.post('/api/auth/verify-otp', { identifier, otp, password });
      setMsg({ type: 'success', text: 'Password reset successful! Redirecting to login...' });
      
      // Delay navigation to show success message
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.msg || 'Verification failed. Please check the code.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-[#0f0f0f] font-sans transition-colors duration-200">


      {/* --- MAIN CONTENT CARD --- */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg border-t-4 border-green-600 dark:border-green-500 p-8 transition-colors duration-200">
          
          {/* Header Section */}
          <div className="text-center mb-8 border-b border-gray-200 dark:border-zinc-700 pb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify & Reset</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Enter the OTP sent to <strong>{identifier || 'your account'}</strong> Check your spam box also.
            </p>
          </div>

          {/* Message Alert */}
          {msg && (
            <div className={`mb-6 p-4 rounded-md flex items-start gap-3 text-sm border-l-4 shadow-sm ${
              msg.type === 'success' 
                ? 'bg-green-50 text-green-800 border-green-600 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-red-50 text-red-800 border-red-600 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {msg.type === 'success' ? <CheckCircle size={18} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            
            {/* Identifier (Read-onlyish but editable if needed) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                Account Email
              </label>
              <div className="relative">
                <input 
                  value={identifier} 
                  onChange={e => setIdentifier(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-800 dark:focus:ring-yellow-500 transition-all placeholder-gray-400" 
                  placeholder="name@example.com"
                  required 
                />
                <div className="absolute left-3 top-3 text-gray-400">
                  <Mail size={18} />
                </div>
              </div>
            </div>

            {/* OTP Code */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                Enter 6-Digit Code
              </label>
              <div className="relative">
                <input 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-800 dark:focus:ring-yellow-500 transition-all placeholder-gray-400 tracking-widest font-mono" 
                  placeholder="• • • • • •"
                  maxLength={6}
                  required 
                />
                <div className="absolute left-3 top-3 text-gray-400">
                  <Key size={18} />
                </div>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                New Password (Min 8 chars)
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-800 dark:focus:ring-yellow-500 transition-all placeholder-gray-400" 
                  placeholder="Enter new secure password"
                  required 
                  minLength={8}
                />
                <div className="absolute left-3 top-3 text-gray-400">
                  <Lock size={18} />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded font-bold text-white shadow-sm transition-all mt-4 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-500'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  Reset Password <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Section */}
          <div className="mt-6 text-center">
            <Link 
              to="/forgot-otp" 
              className="text-xs font-medium text-blue-800 dark:text-yellow-500 hover:underline transition-colors"
            >
              Didn't receive the code? Try again
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}