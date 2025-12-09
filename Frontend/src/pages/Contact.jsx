import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  MessageSquare
} from "lucide-react";

export default function Contact() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  });

  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function validateForm() {
    if (!form.name.trim()) {
      return "Please enter your full name.";
    }
    if (!form.email.trim()) {
      return "Please enter your email address.";
    }
    // simple email regex
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!emailOk) {
      return "Please enter a valid email address.";
    }
    if (!form.category) {
      return "Please select a query type.";
    }
    if (!form.subject.trim()) {
      return "Please enter a brief subject.";
    }
    if (!form.message.trim() || form.message.trim().length < 15) {
      return "Please describe your issue (at least 15 characters).";
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    const validationError = validateForm();
    if (validationError) {
      setMsg({ type: "error", text: validationError });
      return;
    }

    setLoading(true);
    try {
      // You can change this endpoint later when backend route is ready
      await api.post("/api/support/contact", form);


      setMsg({
        type: "success",
        text: "Your message has been submitted. Our support team will contact you soon.",
      });

      setForm({
        name: "",
        email: "",
        category: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      const text =
        err?.response?.data?.msg ||
        err?.message ||
        "Unable to send your message. Please try again later.";
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex flex-col font-sans transition-colors duration-200">
      
      {/* --- HEADER --- */}
      <header className="bg-white dark:bg-[#1a1a1a] shadow-md border-b border-gray-200 dark:border-zinc-800 relative z-10">
        <div className="bg-[#0B2447] dark:bg-black text-white text-[10px] md:text-xs font-semibold py-1.5 px-4 border-b border-yellow-500">
          <div className="max-w-[1400px] mx-auto flex justify-between items-center">
            <span>GOVERNMENT OF INDIA</span>
            <span>OFFICIAL E-VOTING SUPPORT</span>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0B2447]/10 dark:bg-yellow-400/20 flex items-center justify-center border border-[#0B2447]/20 dark:border-yellow-400/20">
              <Mail className="text-[#0B2447] dark:text-yellow-400" size={20} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-[#0B2447] dark:text-white tracking-tight leading-none">
                Contact Support
              </h1>
              <p className="text-xs text-gray-500 md:text-sm dark:text-gray-400 mt-0.5">
                We are here to help you
              </p>
            </div>
          </div>

          {/* Right: Back button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm md:text-sm hover:bg-gray-50 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300 transition-all transform hover:-translate-y-0.5"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex items-center justify-center flex-1 px-4 py-8">
        {/* Updated Container Width to 1400px */}
        <div className="max-w-[1400px] w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT: INFO PANEL & IMAGE --- */}
          <section className="flex flex-col gap-6 lg:col-span-1">
            
           

            {/* 2. Contact Details Card */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 p-6 flex-1">
              <h2 className="pb-3 mb-4 text-lg font-bold text-gray-900 border-b border-gray-100 dark:text-white dark:border-zinc-800">
                Contact Information
              </h2>
              
              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[#0B2447] dark:text-blue-400">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">
                      Headquarters
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      National E-Voting Cell, <br/>
                      Ministry of Electronics & IT, <br/>
                      Electronics Niketan, New Delhi
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 mt-1 text-orange-600 rounded-full bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">
                      Support Hours
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Mon – Fri, 9:00 AM to 6:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 mt-1 text-green-600 rounded-full bg-green-50 dark:bg-green-900/20 dark:text-green-400">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">
                      Helpline (Toll Free)
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      1800-111-2222
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 mt-1 text-purple-600 rounded-full bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">
                      Email Support
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      support@e-voting.gov.in
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 dark:border-zinc-800">
                <p className="text-[10px] text-gray-400 dark:text-zinc-500 text-center">
                  *Standard call rates may apply for non-toll-free numbers.
                </p>
              </div>
            </div>
          </section>

          {/* --- RIGHT: FORM --- */}
          <section className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <MessageSquare size={24} className="text-[#0B2447] dark:text-yellow-400"/>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Send us a Message
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fill out the form below and we will get back to you shortly.
                    </p>
                </div>
            </div>

            {msg && (
              <div
                className={`mb-6 px-4 py-3 text-sm border-l-4 rounded-r flex items-center gap-3 shadow-sm ${
                  msg.type === "success"
                    ? "bg-green-50 text-green-800 border-green-600 dark:bg-green-900/20 dark:text-green-300"
                    : "bg-red-50 text-red-800 border-red-600 dark:bg-red-900/20 dark:text-red-300"
                }`}
              >
                {msg.type === "success" ? (
                  <CheckCircle size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <span className="font-medium">{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name + Email */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block mb-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                  Query Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-transparent transition-all appearance-none"
                    >
                    <option value="">Select a category</option>
                    <option value="login">Login / OTP Issue</option>
                    <option value="registration">Registration / KYC Issue</option>
                    <option value="voting">Voting Process Issue</option>
                    <option value="technical">Technical Error (Page/Server)</option>
                    <option value="other">Others</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pointer-events-none">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block mb-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="Brief summary of your issue"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block mb-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Please describe your issue in detail..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-transparent transition-all resize-y"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 text-sm font-bold text-white uppercase tracking-wide bg-[#0B2447] rounded-lg shadow-md hover:bg-[#1a3a5e] disabled:opacity-70 disabled:cursor-not-allowed dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300 transition-all transform hover:-translate-y-0.5"
                >
                  {loading ? "Sending..." : "Submit Query"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}