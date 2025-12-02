// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Link } from "react-router-dom";


export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/api/auth/me");
        setUser(res.data.user);
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
  }, [navigate]);

  const verificationBadge = () => {
    const status = user?.verificationStatus || "pending";
    if (status === "approved")
      return (
        <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">
          Verified
        </span>
      );
    if (status === "rejected")
      return (
        <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-700">
          Rejected
        </span>
      );
    return (
      <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700">
        Pending
      </span>
    );
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await api.post("/api/auth/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((u) => ({ ...u, avatarUrl: res.data.avatarUrl }));
      setMsg({ type: "success", text: res.data.msg });
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setMsg({ type: "error", text: "New passwords do not match" });
      return;
    }

    setBusy(true);
    try {
      const res = await api.post("/api/auth/change-password", {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setMsg({ type: "success", text: res.data.msg });
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    const password = window.prompt(
      "Enter your password to confirm account deletion:"
    );
    if (!password) return;

    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    setBusy(true);
    setMsg(null);
    try {
      const res = await api.delete("/api/auth/delete-account", {
        data: { password },
      });
      setMsg({ type: "success", text: res.data.msg });

      // log out
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (!user) return <div className="p-6">User not found.</div>;

  // build avatar URL
  const avatarSrc = user.avatarUrl
    ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${
        user.avatarUrl
      }`
    : null;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Profile</h1>
         
          <button onClick={() => navigate("/my-votes")} className="text-sm text-blue-600 hover:underline">
         View My Votes
          </button>

          <button onClick={() => navigate("/dashboard")}  className="text-sm text-blue-600 hover:underline" >
            ⬅ Back to dashboard
          </button>
       
        </div>
        {msg && (
          <div
            className={`p-3 rounded ${
              msg.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* top card: avatar + info */}
        <div className="flex items-center gap-4 p-4 bg-white rounded shadow">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-20 h-20 overflow-hidden text-2xl text-gray-500 bg-gray-200 rounded-full">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="object-cover w-full h-full"
                />
              ) : (
                <span>{user.name?.[0]?.toUpperCase() || "U"}</span>
              )}
            </div>
            <label className="mt-2 text-xs text-blue-600 cursor-pointer">
              {busy ? "Uploading..." : "Change photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={busy}
              />
            </label>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{user.name}</h2>
              {verificationBadge()}
            </div>
            <p className="text-sm text-gray-700">{user.email}</p>
            <p className="mt-1 text-xs text-gray-500">
              Role: <span className="font-medium">{user.role}</span>
            </p>
            <div className="mt-2 space-y-1 text-xs text-gray-600">
              {user.dob && (
                <p>
                  Date of Birth:{" "}
                  {new Date(user.dob).toLocaleDateString("en-IN")}
                </p>
              )}
              {user.idType && <p>ID Type: {user.idType}</p>}
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
              >
                Logout
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-3 py-1 text-xs text-red-600 border border-red-400 rounded hover:bg-red-50"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>

        {/* change password */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-3 text-sm font-semibold">Change password</h2>
          <form
            onSubmit={handleChangePassword}
            className="grid max-w-md gap-3 text-sm"
          >
            <input
              type="password"
              placeholder="Current password"
              value={pwdForm.currentPassword}
              onChange={(e) =>
                setPwdForm({ ...pwdForm, currentPassword: e.target.value })
              }
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={pwdForm.newPassword}
              onChange={(e) =>
                setPwdForm({ ...pwdForm, newPassword: e.target.value })
              }
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={pwdForm.confirmPassword}
              onChange={(e) =>
                setPwdForm({ ...pwdForm, confirmPassword: e.target.value })
              }
              className="px-3 py-2 border rounded"
              required
            />
            <button
              type="submit"
              disabled={busy}
              className={`px-4 py-2 rounded text-white text-sm ${
                busy ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {busy ? "Working..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
