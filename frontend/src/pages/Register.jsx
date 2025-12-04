// src/pages/Register.jsx
import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    idType: "",
    idNumber: "",
  });
  const [idFile, setIdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("dob", form.dob);
      fd.append("idType", form.idType);
      fd.append("idNumber", form.idNumber);
      if (idFile) fd.append("idDoc", idFile);

      const res = await api.post("/api/auth/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg({ type: "success", text: res.data.msg || "Registered." });
      // optional: redirect to login
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      console.error(err);
      const text = err?.response?.data?.msg || err?.message || "Registration failed";
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  const [confirmPassword, setConfirmPassword] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (form.password !== confirmPassword) {
      setMsg({ type: "error", text: "Passwords do not match" });
      setLoading(false);
      return;
    }

    setMsg(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("dob", form.dob);
      fd.append("idType", form.idType);
      fd.append("idNumber", form.idNumber);
      if (idFile) fd.append("idDoc", idFile);

      const res = await api.post("/api/auth/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg({ type: "success", text: res.data.msg || "Registered." });
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      console.error(err);
      const text = err?.response?.data?.msg || err?.message || "Registration failed";
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-2xl font-semibold">Register (Voter)</h2>

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
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Full name "
            pattern="[A-Za-z\s]+"
            title="Name should only contain letters and spaces"
            className="w-full p-2 border rounded"
          />

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

          <input
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            required
            type="password"
            placeholder="Confirm Password"
            className="w-full p-2 border rounded"
          />

          <div className="flex gap-2">
            <input
              name="dob"
              value={form.dob}
              onChange={handleChange}
              required
              type="date"
              className="w-1/2 p-2 border rounded"
            />
            <select
              name="idType"
              value={form.idType}
              onChange={handleChange}
              required
              className="w-1/2 p-2 border rounded"
            >
              <option value="">Select ID type</option>
              <option value="Aadhaar">Aadhaar</option>
              <option value="VoterID">VoterID</option>
              <option value="StudentID">StudentID</option>
              <option value="Passport">Passport</option>
            </select>
          </div>

          <input
            name="idNumber"
            value={form.idNumber}
            onChange={handleChange}
            required
            placeholder="ID number"
            className="w-full p-2 border rounded"
          />

          <label className="block text-sm text-gray-600">
            Upload ID document (image/pdf)
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setIdFile(e.target.files?.[0])}
              required
              className="mt-2"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <div className="text-sm text-center">
            Already have an account?{" "}
            <button type="button" onClick={() => navigate("/login")} className="text-blue-600 underline">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
