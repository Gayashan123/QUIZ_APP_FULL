import React, { useEffect, useMemo, useState } from "react";
import { apiurl, token as tokenFromLS } from "../../Admin/common/Http";

function AdminSideNav({ section, setSection }) {
  const items = [
    { key: "account", label: "Account" },
    { key: "security", label: "Security" },
  ];
  return (
    <aside className="w-full sm:w-64 shrink-0">
      <div className="sticky top-0 p-4 sm:p-0">
        <nav className="bg-white/80 backdrop-blur rounded-3xl shadow-sm border border-slate-200 p-3">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => setSection(it.key)}
              className={`w-full text-left px-4 py-3 rounded-2xl font-medium transition-colors ${
                section === it.key
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {it.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

const makeHeaders = () => {
  const h = new Headers();
  h.set("Accept", "application/json");
  h.set("Content-Type", "application/json");
  const tk = tokenFromLS?.();
  if (tk) h.set("Authorization", `Bearer ${tk}`);
  return h;
};

const fetchJSON = async (url, opts = {}) => {
  const res = await fetch(url, { ...opts, headers: makeHeaders() });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(typeof data === "string" ? data : data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
};

function EmailForm({ initialEmail }) {
  const [email, setEmail] = useState(initialEmail || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => setEmail(initialEmail || ""), [initialEmail]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const resp = await fetchJSON(`${apiurl}admin/email`, {
        method: "PUT",
        body: JSON.stringify({ email, current_password: currentPassword }),
      });
      setMsg(resp?.message || "Email updated successfully.");
      setCurrentPassword("");
    } catch (error) {
      setErr(error?.payload?.message || "Failed to update email.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-white/80 backdrop-blur rounded-3xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-semibold mb-4">Email</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">New Email</label>
          <input
            type="email"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Current Password</label>
          <input
            type="password"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-5 py-3 rounded-2xl bg-slate-900 text-white hover:bg-black disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Email"}
          </button>
          {msg && <span className="text-emerald-600 text-sm">{msg}</span>}
          {err && <span className="text-rose-600 text-sm">{err}</span>}
        </div>
      </div>
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const resp = await fetchJSON(`${apiurl}admin/password`, {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
      setMsg(resp?.message || "Password updated successfully.");
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
    } catch (error) {
      setErr(
        error?.payload?.message ||
        (error?.payload?.errors ? Object.values(error.payload.errors).flat().join(" ") : "Failed to update password.")
      );
    } finally {
      setSaving(false);
    }
  };

  const eyeBtn = (which) => (
    <button
      type="button"
      onClick={() => setShow((s) => ({ ...s, [which]: !s[which] }))}
      className="text-slate-500 hover:text-slate-700 text-sm px-2"
      title={show[which] ? "Hide" : "Show"}
    >
      {show[which] ? "Hide" : "Show"}
    </button>
  );

  return (
    <form onSubmit={onSubmit} className="bg-white/80 backdrop-blur rounded-3xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-semibold mb-4">Password</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Current Password</label>
          <div className="flex items-center rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-slate-300">
            <input
              type={show.current ? "text" : "password"}
              className="w-full rounded-2xl px-4 py-3 focus:outline-none"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            {eyeBtn("current")}
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">New Password</label>
          <div className="flex items-center rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-slate-300">
            <input
              type={show.new ? "text" : "password"}
              className="w-full rounded-2xl px-4 py-3 focus:outline-none"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            {eyeBtn("new")}
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Confirm Password</label>
          <div className="flex items-center rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-slate-300">
            <input
              type={show.confirm ? "text" : "password"}
              className="w-full rounded-2xl px-4 py-3 focus:outline-none"
              placeholder="Re-enter new password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
            {eyeBtn("confirm")}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-5 py-3 rounded-2xl bg-slate-900 text-white hover:bg-black disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Password"}
          </button>
          {msg && <span className="text-emerald-600 text-sm">{msg}</span>}
          {err && <span className="text-rose-600 text-sm">{err}</span>}
        </div>
      </div>
    </form>
  );
}

export default function AdminSetting() {
  const [section, setSection] = useState("account");
  const [email, setEmail] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingProfile(true);
      try {
        const data = await fetchJSON(`${apiurl}admin/me`);
        if (!mounted) return;
        setEmail(data?.data?.email || "");
      } catch (e) {
        console.error("Failed to load admin profile:", e);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Large iOS-style title */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-600 mt-1">{greeting}, Admin</p>
        </header>

        <div className="flex flex-col sm:flex-row gap-6">
          <AdminSideNav section={section} setSection={setSection} />

          <main className="flex-1 space-y-6">
            {loadingProfile ? (
              <div className="bg-white/80 backdrop-blur rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="animate-pulse h-6 bg-slate-200 rounded w-1/3 mb-4" />
                <div className="animate-pulse h-10 bg-slate-200 rounded mb-3" />
                <div className="animate-pulse h-10 bg-slate-200 rounded mb-3" />
              </div>
            ) : (
              <>
                {section === "account" && <EmailForm initialEmail={email} />}
                {section === "security" && <PasswordForm />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}