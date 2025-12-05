import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  MessageSquare, 
  ArrowLeft, 
  Loader2, 
  KeyRound, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

export default function ForgotOtp() {
  const [identifier, setIdentifier] = useState('');
  const [via, setVia] = useState('email'); // 'email' or 'sms'
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      await api.post('/api/auth/request-reset-otp', { identifier, via });
      setMsg({ type: 'success', text: 'A One-Time Password (OTP) has been sent. Please check your inbox/messages.' });
      
      // Redirect to verification page after short delay
      setTimeout(() => {
        navigate('/verify-otp', { state: { identifier } });
      }, 2000);
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.msg || 'Unable to process request. Please try again later.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-[#0f0f0f] font-sans transition-colors duration-200">


      {/* --- MAIN CONTENT CARD --- */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg border-t-4 border-blue-800 dark:border-yellow-500 p-8 transition-colors duration-200">
          
          {/* Header Section */}
          <div className="text-center mb-8 border-b border-gray-200 dark:border-zinc-700 pb-6">
            <div className="mx-auto h-14 w-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-800 dark:text-blue-400 mb-4">
              <KeyRound size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Password Recovery</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Select a method to receive your One-Time Password (OTP) for account recovery.
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

          <form onSubmit={submit} className="space-y-6">
            
            {/* Delivery Method Selection */}
            <div className="space-y-2">
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                 Select Delivery Method
               </label>
               <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVia('email')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded border-2 transition-all ${
                      via === 'email'
                        ? 'border-blue-800 bg-blue-50 text-blue-800 dark:border-yellow-500 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-zinc-600 dark:text-gray-400 dark:hover:border-zinc-500'
                    }`}
                  >
                    <Mail size={18} /> Email
                  </button>
                 
               </div>
            </div>

            {/* Input Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {via === 'email' ? 'Registered Email Address' : 'Registered Phone Number'} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input 
                  value={identifier} 
                  onChange={e => setIdentifier(e.target.value)} 
                  type="email" 
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-800 dark:focus:ring-yellow-500 focus:border-transparent transition-all placeholder-gray-400" 
                  placeholder="e.g. citizen@example.com"    
                  required 
                />
                <div className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
                  {via === 'email' ? <Mail size={18} /> : <MessageSquare size={18} />}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                 {via === 'email' ? 'The email address associated with your account.' : 'The mobile number linked to your profile.'}
              </p>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || !identifier}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded font-bold text-white shadow-sm transition-all ${
                loading || !identifier
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#0B2447] hover:bg-[#1a3a5e] dark:bg-yellow-500 dark:text-black dark:hover:bg-yellow-400'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Processing...
                </>
              ) : (
                'Generate OTP'
              )}
            </button>
          </form>

          {/* Footer Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-700 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-yellow-500 hover:underline transition-colors"
            >
              <ArrowLeft size={16} /> Return to Login Page
            </Link>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
               © {new Date().getFullYear()} Official E-Voting Portal. All rights reserved.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}