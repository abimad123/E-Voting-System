// src/pages/Login.jsx
import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await api.post("/api/auth/login", form);
      const token = res.data.token;
      const user = res.data.user;
      // store
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setMsg({ type: "success", text: "Login successful" });

      // redirect based on role
      setTimeout(() => {
        if (user.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      }, 800);
    } catch (err) {
      console.error(err);
      const text = err?.response?.data?.msg || err?.message || "Login failed";
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="mb-4 text-2xl font-semibold">Login</h2>

        {msg && (
          <div
            className={`mb-4 p-3 rounded ${
              msg.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
          />

          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-sm text-center">
            Don't have an account?{" "}
            <button type="button" onClick={() => navigate("/register")} className="text-blue-600 underline">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
