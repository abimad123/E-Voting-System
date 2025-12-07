// src/pages/ForgotOtp.jsx
import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { loadTurnstileScript } from "../utils/loadTurnstile";

export default function ForgotOtp() {
  const [form, setForm] = useState({
    identifier: "",
    via: "email",
    turnstile: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const widgetRef = useRef(null);
  const widgetIdRef = useRef(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  // Load + render Turnstile
  useEffect(() => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (!siteKey) return;

    let mounted = true;

    loadTurnstileScript()
      .then(() => {
        if (!mounted) return;
        if (!window.turnstile || !widgetRef.current) return;

        widgetIdRef.current = window.turnstile.render(widgetRef.current, {
          sitekey: siteKey,
          callback: (token) =>
            setForm((s) => ({ ...s, turnstile: token })),
          "error-callback": () =>
            setForm((s) => ({ ...s, turnstile: "" })),
          "expired-callback": () =>
            setForm((s) => ({ ...s, turnstile: "" })),
        });
      })
      .catch((err) => console.error("Turnstile load error:", err));

    return () => {
      mounted = false;
      try {
        if (window.turnstile && widgetIdRef.current !== null) {
          window.turnstile.remove(widgetIdRef.current);
        }
      } catch (e) {}
    };
  }, []);

   async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (siteKey && !form.turnstile) {
      setMsg({
        type: "error",
        text: "Please complete the human verification.",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        identifier: form.identifier,
        via: form.via,
        turnstile: form.turnstile,
      };

      const res = await api.post("/api/auth/request-reset-otp", payload);

      // Optional: show message briefly
      setMsg({
        type: "success",
        text:
          res.data?.msg ||
          "If that account exists, you will receive an OTP shortly.",
      });

      // 👉 Navigate to Verify OTP page, passing email + via
      navigate("/verify-otp", {
        state: {
          identifier: form.identifier,
          via: form.via,
        },
      });
    } catch (err) {
      console.error(err);
      const text =
        err?.response?.data?.msg ||
        err?.message ||
        "Unable to process request. Please try again later.";
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-100">
      <div className="w-full max-w-md bg-white border shadow-lg rounded-xl border-slate-200">
        <div className="h-1.5 w-full bg-blue-900" />

        <div className="p-8">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 text-blue-700 rounded-full bg-blue-50">
              🔐
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Password Recovery
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Select a method to receive your One-Time Password (OTP)
              for account recovery.
            </p>
          </div>

          {msg && (
            <div
              className={`mb-4 p-3 text-sm border-l-4 rounded-r ${
                msg.type === "success"
                  ? "border-green-600 bg-green-50 text-green-800"
                  : "border-red-600 bg-red-50 text-red-800"
              }`}
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Delivery method (only email for now) */}
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-600">
                Select Delivery Method
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <button
                  type="button"
                  onClick={() =>
                    setForm((s) => ({ ...s, via: "email" }))
                  }
                  className={
                    "border rounded-md py-2 flex items-center justify-center gap-2 " +
                    (form.via === "email"
                      ? "border-blue-700 text-blue-700 bg-blue-50"
                      : "border-slate-300 text-slate-600 bg-white")
                  }
                >
                  📧 Email
                </button>
                <button
                  type="button"
                  disabled
                  className="flex items-center justify-center gap-2 py-2 border rounded-md cursor-not-allowed border-slate-200 text-slate-400 bg-slate-50"
                >
                  💬 SMS (Coming soon)
                </button>
              </div>
            </div>

            {/* Email field */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-700">
                Registered Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="identifier"
                  type="email"
                  required
                  value={form.identifier}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded text-sm text-slate-900 focus:ring-1 focus:ring-blue-800 focus:border-blue-800 outline-none bg-slate-50"
                />
                <span className="absolute text-sm -translate-y-1/2 left-3 top-1/2 text-slate-400">
                  ✉️
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                The email address associated with your account.
              </p>
            </div>

            {/* Turnstile widget */}
            <div ref={widgetRef} className="my-1" />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold rounded shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Generate OTP"}
            </button>
          </form>

          <button
            onClick={() => navigate("/login")}
            className="w-full mt-6 text-xs text-center text-blue-800 hover:underline"
          >
            ← Return to Login Page
          </button>
        </div>

        <div className="px-8 py-3 border-t border-slate-100 bg-slate-50 text-[11px] text-center text-slate-500">
          © 2025 Official E-Voting Portal. All rights reserved.
        </div>
      </div>
    </div>
  );
}
