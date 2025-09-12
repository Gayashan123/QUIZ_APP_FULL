import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Mail,
  Smartphone,
  Save,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Sliders,
  Clock,
  Shuffle,
  User,
} from "lucide-react";
import { apiurl, token as tokenFromLS } from "../../Admin/common/Http";

/* ---------------- HTTP helpers ---------------- */
const normalizeBase = (base) =>
  typeof base === "string" ? base.replace(/\/+$/, "") + "/" : "/";
const API_ROOT = normalizeBase(apiurl);

const getToken = () => {
  try {
    const t = typeof tokenFromLS === "function" ? tokenFromLS() : tokenFromLS;
    return t || "";
  } catch {
    return "";
  }
};

const makeHeaders = () => {
  const h = new Headers();
  h.set("Accept", "application/json");
  h.set("Content-Type", "application/json");
  const tk = getToken();
  if (tk) h.set("Authorization", `Bearer ${tk}`);
  return h;
};

const fetchJSON = async (path, opts = {}) => {
  const url = path.startsWith("http") ? path : API_ROOT + path.replace(/^\/+/, "");
  const res = await fetch(url, { ...opts, headers: makeHeaders() });
  if (!res.ok) {
    let msg = "";
    try {
      msg = await res.text();
    } catch {}
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
};

/* ---------------- UI helpers ---------------- */
const GlassCard = ({ children, className = "" }) => (
  <div
    className={[
      "bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/30",
      "shadow-2xl shadow-blue-100/30 p-6 transition-all duration-300",
      "hover:shadow-2xl hover:shadow-blue-200/50",
      className,
    ].join(" ")}
  >
    {children}
  </div>
);

const Field = ({ label, children, hint }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    <div className="mt-1">{children}</div>
    {hint ? <p className="text-xs text-slate-500 mt-1">{hint}</p> : null}
  </div>
);

const Toggle = ({ checked, onChange, label, icon: Icon }) => (
  <button
    type="button"
    onClick={onChange}
    className={`flex items-center justify-between w-full rounded-2xl border px-4 py-3 transition 
      ${checked ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200 hover:bg-slate-50"}`}
  >
    <span className="flex items-center gap-2">
      {Icon ? <Icon className={checked ? "text-indigo-600" : "text-slate-500"} size={18} /> : null}
      <span className="text-sm font-medium">{label}</span>
    </span>
    <span
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition",
        checked ? "bg-indigo-600" : "bg-slate-300",
      ].join(" ")}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={[
          "inline-block h-5 w-5 transform rounded-full bg-white transition",
          checked ? "translate-x-5" : "translate-x-1",
        ].join(" ")}
      />
    </span>
  </button>
);

const SaveButton = ({ loading, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-medium"
  >
    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
    {children}
  </button>
);

const Banner = ({ kind = "success", children }) => {
  const styles =
    kind === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-rose-50 text-rose-700 border-rose-200";
  const Icon = kind === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div className={`flex items-start gap-2 rounded-2xl border px-3 py-2 ${styles}`}>
      <Icon className="w-5 h-5 mt-0.5" />
      <div className="text-sm">{children}</div>
    </div>
  );
};

/* ---------------- Component ---------------- */
export default function TeacherSettings() {
  const [teacherId, setTeacherId] = useState(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const [initError, setInitError] = useState("");

  // Profile
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    password: "",
    avatarDataUrl: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Notifications (stored locally)
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
    sms: false,
  });
  const [notifMsg, setNotifMsg] = useState("");
  const [savingNotif, setSavingNotif] = useState(false);

  // Quiz defaults (stored locally)
  const [quizDefaults, setQuizDefaults] = useState({
    gradingScheme: "percentage",
    defaultTimeLimit: 30,
    randomOrder: false,
  });
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [quizMsg, setQuizMsg] = useState("");

  // Theme (stored locally + applied to document)
  const [theme, setTheme] = useState("light");
  const [themeMsg, setThemeMsg] = useState("");

  /* -------- load teacher + local prefs -------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingInit(true);
      setInitError("");
      try {
        const data = await fetchJSON("checkauth");
        // try to resolve name/email/id from different shapes
        const t =
          data?.teacher ||
          data?.data ||
          data?.user ||
          data ||
          {};
        const id = t?.id || t?.teacher_id || t?.user_id || null;
        const name = t?.name || t?.full_name || "";
        const email = t?.email || "";
        if (mounted) {
          setTeacherId(id);
          setProfile((p) => ({
            ...p,
            name: name || p.name,
            email: email || p.email,
            avatarDataUrl: localStorage.getItem("teacher:avatar") || "",
          }));
        }
      } catch (e) {
        console.error("checkauth failed:", e);
        if (mounted) setInitError("Failed to load your profile. Please refresh.");
      } finally {
        if (mounted) setLoadingInit(false);
      }

      // Load local settings
      try {
        const nStr = localStorage.getItem("teacher:notifications");
        if (nStr) {
          const n = JSON.parse(nStr);
          if (mounted) setNotifications((prev) => ({ ...prev, ...n }));
        }
      } catch {}
      try {
        const qStr = localStorage.getItem("teacher:quizDefaults");
        if (qStr) {
          const q = JSON.parse(qStr);
          if (mounted) setQuizDefaults((prev) => ({ ...prev, ...q }));
        }
      } catch {}
      try {
        const th = localStorage.getItem("teacher:theme");
        if (th) {
          if (mounted) {
            setTheme(th);
            applyTheme(th);
          }
        } else {
          applyTheme(theme);
        }
      } catch {}
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyTheme = (mode) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else if (mode === "light") {
      root.classList.remove("dark");
    } else {
      // system: remove explicit and let OS decide (if using Tailwind dark: 'media')
      root.classList.remove("dark");
    }
  };

  const initials = useMemo(() => {
    const parts = (profile.name || "").split(" ").filter(Boolean);
    return parts.length ? parts.map((p) => p[0]?.toUpperCase()).slice(0, 2).join("") : "T";
  }, [profile.name]);

  /* -------- actions -------- */
  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setProfile((p) => ({ ...p, avatarDataUrl: url }));
      localStorage.setItem("teacher:avatar", url); // Client-only persistence
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setProfileMsg("");
    if (!teacherId) {
      setProfileMsg("Unable to resolve your teacher ID. Please re-login.");
      return;
    }
    if (!profile.name.trim() || !profile.email.trim()) {
      setProfileMsg("Name and email are required.");
      return;
    }
    setSavingProfile(true);
    try {
      const payload = {
        name: profile.name.trim(),
        email: profile.email.trim(),
      };
      if (profile.password.trim()) payload.password = profile.password.trim();

      // PUT /teachers/{id}
      await fetchJSON(`teachers/${teacherId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setProfile((p) => ({ ...p, password: "" }));
      setProfileMsg("Profile updated successfully.");
    } catch (e) {
      console.error("Update profile failed:", e);
      setProfileMsg("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveNotifications = async () => {
    setNotifMsg("");
    setSavingNotif(true);
    try {
      localStorage.setItem("teacher:notifications", JSON.stringify(notifications));
      setNotifMsg("Notification preferences saved.");
    } catch {
      setNotifMsg("Failed to save notification preferences.");
    } finally {
      setSavingNotif(false);
    }
  };

  const saveQuizDefaults = async () => {
    setQuizMsg("");
    setSavingQuiz(true);
    try {
      localStorage.setItem("teacher:quizDefaults", JSON.stringify(quizDefaults));
      setQuizMsg("Default quiz settings saved.");
    } catch {
      setQuizMsg("Failed to save quiz defaults.");
    } finally {
      setSavingQuiz(false);
    }
  };

  const setThemeAndSave = (mode) => {
    setTheme(mode);
    applyTheme(mode);
    localStorage.setItem("teacher:theme", mode);
    setThemeMsg(`Theme updated to ${mode}.`);
  };

  /* -------- UI -------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40 flex flex-col md:flex-row text-slate-900">
      <Sidebar teacherName={profile.name || "Teacher"} />

      <main className="flex-1 flex flex-col overflow-auto">
      

        <div className="relative max-w-5xl mx-auto w-full px-4 md:px-8 py-8">
          {/* Background blobs */}
          <div className="fixed inset-0 pointer-events-none -z-10">
            <div className="absolute top-20 right-20 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
          </div>

          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-slate-600 mt-1">Manage your profile, preferences, and defaults.</p>
            {loadingInit && (
              <div className="mt-3">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              </div>
            )}
            {initError && (
              <div className="mt-3">
                <Banner kind="error">{initError}</Banner>
              </div>
            )}
          </header>

          {/* Profile */}
          <GlassCard className="mb-8">
            <div className="flex items-start gap-6">
             
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <User className="text-indigo-600" /> Profile
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Name">
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 focus:ring-2 focus:ring-indigo-300 outline-none"
                      value={profile.name}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 focus:ring-2 focus:ring-indigo-300 outline-none"
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    />
                  </Field>
                  <Field label="Password" hint="Leave blank to keep current password">
                    <input
                      type="password"
                      className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 focus:ring-2 focus:ring-indigo-300 outline-none"
                      placeholder="Change password"
                      value={profile.password}
                      onChange={(e) => setProfile((p) => ({ ...p, password: e.target.value }))}
                    />
                  </Field>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <SaveButton loading={savingProfile} onClick={saveProfile}>
                    Save Profile
                  </SaveButton>
                  {profileMsg && (
                    <span>
                      <Banner kind={profileMsg.includes("success") ? "success" : "error"}>
                        {profileMsg}
                      </Banner>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

         


          {/* Theme */}
          <GlassCard className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Theme
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setThemeAndSave("light")}
                className={[
                  "rounded-2xl border p-4 text-left transition",
                  theme === "light"
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 font-medium">
                  <Sun className="text-yellow-500" /> Light
                </div>
                <p className="text-xs text-slate-500 mt-1">Bright and clear interface.</p>
              </button>

              <button
                type="button"
                onClick={() => setThemeAndSave("dark")}
                className={[
                  "rounded-2xl border p-4 text-left transition",
                  theme === "dark"
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 font-medium">
                  <Moon className="text-slate-800" /> Dark
                </div>
                <p className="text-xs text-slate-500 mt-1">Low-light viewing comfort.</p>
              </button>

              <button
                type="button"
                onClick={() => setThemeAndSave("system")}
                className={[
                  "rounded-2xl border p-4 text-left transition",
                  theme === "system"
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 font-medium">
                  <Monitor className="text-slate-600" /> System
                </div>
                <p className="text-xs text-slate-500 mt-1">Match your OS preference.</p>
              </button>
            </div>

            {themeMsg && <div className="mt-4"><Banner kind="success">{themeMsg}</Banner></div>}
          </GlassCard>
        </div>
      </main>
    </div>
  );
}