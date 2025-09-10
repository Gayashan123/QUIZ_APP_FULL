// src/Student/pages/SettingsPage.jsx
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/Auth";
import { apiurl } from "../../Admin/common/Http";
import Sidebar from "../component/Sidebar";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaSyncAlt,
  FaCheckCircle,
} from "react-icons/fa";

export default function SettingsPage() {
  const { user, setUser } = useContext(AuthContext); // setUser optional if available

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Profile form
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password form
  const [pwd, setPwd] = useState({
    current: "",
    next: "",
    confirm: "",
    showCurrent: false,
    showNext: false,
    showConfirm: false,
  });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  // Danger zone
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user?.id || !user?.token) return;
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const res = await axios.get(`${apiurl}students/${user.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = res?.data?.data ?? res?.data ?? {};
        if (mounted) {
          setForm({
            name: data.name || user?.name || "",
            email: data.email || user?.email || "",
            phone: data.phone || user?.phone || "",
          });
        }
      } catch (e) {
        setLoadError("Could not load your profile. Please retry.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user?.id, user?.token]);

  // Basic validations
  const validateProfile = () => {
    const errs = {};
    if (!form.name?.trim() || form.name.trim().length < 2) errs.name = "Please enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || "")) errs.email = "Enter a valid email";
    if (form.phone && !/^[0-9+\-\s()]{7,20}$/.test(form.phone)) errs.phone = "Enter a valid phone";
    return errs;
  };

  const validatePassword = () => {
    const errs = {};
    if (!pwd.next || pwd.next.length < 8) errs.next = "New password must be at least 8 characters";
    if (pwd.next && !/[A-Za-z]/.test(pwd.next)) errs.next = "Include letters in your password";
    if (pwd.next && !/\d/.test(pwd.next)) errs.next = "Include numbers in your password";
    if (pwd.next !== pwd.confirm) errs.confirm = "Passwords do not match";
    return errs;
  };

  const [profileErrors, setProfileErrors] = useState({});
  const [pwdErrors, setPwdErrors] = useState({});

  const onProfileSave = async () => {
    const errs = validateProfile();
    setProfileErrors(errs);
    setProfileMsg(null);
    if (Object.keys(errs).length) return;

    try {
      setSavingProfile(true);
      await axios.put(
        `${apiurl}students/${user.id}`,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone?.trim() || null,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setProfileMsg({ type: "success", text: "Profile updated successfully." });

      // Update global auth user if setter exists
      if (typeof setUser === "function") {
        setUser((prev) => ({ ...prev, name: form.name, email: form.email, phone: form.phone }));
      }
    } catch (e) {
      const message =
        e?.response?.data?.message ||
        (e?.response?.data?.errors && Object.values(e.response.data.errors).flat().join(" ")) ||
        "Could not update profile.";
      setProfileMsg({ type: "error", text: message });
    } finally {
      setSavingProfile(false);
    }
  };

  const onPasswordSave = async () => {
    const errs = validatePassword();
    setPwdErrors(errs);
    setPwdMsg(null);
    if (Object.keys(errs).length) return;

    try {
      setSavingPwd(true);
      // Many backends accept password in the same UPDATE endpoint.
      await axios.put(
        `${apiurl}students/${user.id}`,
        {
          // Optional: send current_password if your backend verifies it
          current_password: pwd.current || undefined,
          password: pwd.next,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setPwdMsg({ type: "success", text: "Password updated successfully." });
      setPwd((p) => ({ ...p, current: "", next: "", confirm: "" }));
    } catch (e) {
      const message =
        e?.response?.data?.message ||
        (e?.response?.data?.errors && Object.values(e.response.data.errors).flat().join(" ")) ||
        "Could not update password.";
      setPwdMsg({ type: "error", text: message });
    } finally {
      setSavingPwd(false);
    }
  };

  const onDeleteAccount = async () => {
    if (!confirm("Are you sure you want to permanently delete your account? This cannot be undone.")) return;
    try {
      setDeleting(true);
      await axios.delete(`${apiurl}students/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      alert("Account deleted. You will be logged out.");
      window.location.href = "/loginpage";
    } catch (e) {
      alert("Could not delete the account. Please contact support.");
    } finally {
      setDeleting(false);
    }
  };

  const firstName = (user?.name || "Student").split(" ")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex text-gray-800">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-5 sticky top-0 z-10">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-gray-500">Manage your profile and security</p>
        </header>

        <div className="p-6 md:p-10">
          {/* Welcome card */}
          <section className="mb-8">
            <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl p-6 shadow-lg flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold">Hey, {firstName} </h2>
                <p className="text-white/90">Keep your information up to date and your account secure.</p>
              </div>
              <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/20 font-bold">
                {firstName?.[0] ?? "S"}
              </div>
            </div>
          </section>

          {/* Load error */}
          {loadError && (
            <div className="bg-white border border-red-200 text-red-700 rounded-2xl p-6 flex items-start gap-3 mb-8">
              <FaExclamationTriangle className="mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Could not load your profile</p>
                <p className="text-sm mb-3">{loadError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg"
                >
                  <FaSyncAlt /> Retry
                </button>
              </div>
            </div>
          )}

          {/* Main grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Profile</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Full name"
                  icon={<FaUser />}
                  value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder="Enter your name"
                  error={profileErrors.name}
                />
                <Field
                  label="Email address"
                  icon={<FaEnvelope />}
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  placeholder="name@example.com"
                  error={profileErrors.email}
                />
                <Field
                  label="Phone"
                  icon={<FaPhone />}
                  value={form.phone}
                  onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                  placeholder="+1 555 000 1234"
                  error={profileErrors.phone}
                />
              </div>

              {profileMsg && (
                <InlineAlert
                  tone={profileMsg.type === "success" ? "success" : "error"}
                  text={profileMsg.text}
                  className="mt-4"
                />
              )}

              <div className="mt-5">
                <button
                  onClick={onProfileSave}
                  disabled={savingProfile || loading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-60"
                >
                  {savingProfile ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Security</h3>

              <PasswordField
                label="Current password"
                value={pwd.current}
                onChange={(v) => setPwd((p) => ({ ...p, current: v }))}
                show={pwd.showCurrent}
                onToggleShow={() => setPwd((p) => ({ ...p, showCurrent: !p.showCurrent }))}
                placeholder="••••••••"
              />
              <PasswordField
                label="New password"
                value={pwd.next}
                onChange={(v) => setPwd((p) => ({ ...p, next: v }))}
                show={pwd.showNext}
                onToggleShow={() => setPwd((p) => ({ ...p, showNext: !p.showNext }))}
                placeholder="At least 8 characters"
                error={pwdErrors.next}
              />
              <PasswordField
                label="Confirm new password"
                value={pwd.confirm}
                onChange={(v) => setPwd((p) => ({ ...p, confirm: v }))}
                show={pwd.showConfirm}
                onToggleShow={() => setPwd((p) => ({ ...p, showConfirm: !p.showConfirm }))}
                placeholder="Re-enter new password"
                error={pwdErrors.confirm}
              />

              {pwdMsg && (
                <InlineAlert
                  tone={pwdMsg.type === "success" ? "success" : "error"}
                  text={pwdMsg.text}
                  className="mt-2"
                />
              )}

              <div className="mt-4">
                <button
                  onClick={onPasswordSave}
                  disabled={savingPwd || loading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-60"
                >
                  {savingPwd ? "Updating..." : "Update password"}
                </button>
              </div>
            </div>
          </section>

          {/* Danger zone */}
          <section className="mt-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-red-700">Danger zone</h3>
              <p className="text-sm text-gray-600 mb-4">Delete your account and all associated data.</p>
              <button
                onClick={onDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-sm disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ---------- Small UI components ---------- */
function Field({ label, icon, value, onChange, placeholder, type = "text", error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 bg-white ${error ? "border-red-300" : "border-gray-200"}`}>
        <span className="text-gray-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full outline-none text-sm"
        />
      </div>
      {error ? <div className="text-xs text-red-600 mt-1">{error}</div> : null}
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggleShow, placeholder, error }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 bg-white ${error ? "border-red-300" : "border-gray-200"}`}>
        <FaLock className="text-gray-400" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full outline-none text-sm"
        />
        <button type="button" onClick={onToggleShow} className="text-gray-400 hover:text-gray-600">
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {error ? <div className="text-xs text-red-600 mt-1">{error}</div> : null}
    </div>
  );
}

function InlineAlert({ tone = "success", text, className = "" }) {
  const map = {
    success: "bg-green-50 border-green-200 text-green-700",
    error: "bg-red-50 border-red-200 text-red-700",
  };
  const icon = tone === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />;
  return (
    <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm ${map[tone]} ${className}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}