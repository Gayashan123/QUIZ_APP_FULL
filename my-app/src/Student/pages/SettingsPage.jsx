// src/Student/pages/SettingsPage.jsx
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  lazy,
  Suspense,
} from "react";
import { AuthContext } from "../../context/Auth";
import { toast } from "react-toastify";
import api from "../../Admin/common/api";
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

// Lazy Sidebar
const Sidebar = lazy(() => import("../component/Sidebar"));

/* ---------------- Utilities ---------------- */
const extractApiError = (e) =>
  e?.response?.data?.message ||
  (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(" ") : "") ||
  e?.message ||
  "Request failed";

/* ---------------- Error Boundary ---------------- */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex text-gray-800">
          <div className="flex-1 p-6 md:p-10 flex items-center justify-center">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <FaExclamationTriangle className="text-red-500 text-3xl mx-auto mb-2" />
              <h2 className="text-xl font-semibold">Something went wrong</h2>
              <p className="text-sm text-gray-600">Please refresh and try again.</p>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------------- Main Page ---------------- */
export default function SettingsPage() {
  const { user, setUser } = useContext(AuthContext);

  const userId = user?.id || user?.user?.id;

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

  /* ---------- Validators ---------- */
  const validateProfile = () => {
    const errs = {};
    if (!form.name?.trim() || form.name.trim().length < 2)
      errs.name = "Please enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || ""))
      errs.email = "Enter a valid email";
    if (form.phone && !/^[0-9+\-\s()]{7,20}$/.test(form.phone))
      errs.phone = "Enter a valid phone";
    return errs;
  };

  const validatePassword = () => {
    const errs = {};
    if (!pwd.next || pwd.next.length < 8)
      errs.next = "New password must be at least 8 characters";
    if (pwd.next && !/[A-Za-z]/.test(pwd.next))
      errs.next = "Include letters in your password";
    if (pwd.next && !/\d/.test(pwd.next))
      errs.next = "Include numbers in your password";
    if (pwd.next !== pwd.confirm)
      errs.confirm = "Passwords do not match";
    return errs;
  };

  const [profileErrors, setProfileErrors] = useState({});
  const [pwdErrors, setPwdErrors] = useState({});

  /* ---------- Load profile ---------- */
  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.get(`students/${userId}`);
      const data = res?.data?.data ?? res?.data ?? {};
      setForm({
        name: data.name || user?.name || "",
        email: data.email || user?.email || "",
        phone: data.phone || user?.phone || "",
      });
    } catch (e) {
      const msg = extractApiError(e) || "Could not load your profile. Please retry.";
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [userId, user?.name, user?.email, user?.phone]);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------- Profile save ---------- */
  const onProfileSave = useCallback(async () => {
    const errs = validateProfile();
    setProfileErrors(errs);
    setProfileMsg(null);
    if (Object.keys(errs).length) return;

    try {
      setSavingProfile(true);
      await api.put(`students/${userId}`, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || null,
      });

      setProfileMsg({ type: "success", text: "Profile updated successfully." });
      toast.success("Profile updated successfully.");

      if (typeof setUser === "function") {
        setUser((prev) => ({
          ...prev,
          name: form.name,
          email: form.email,
          phone: form.phone,
        }));
      }
    } catch (e) {
      const message = extractApiError(e) || "Could not update profile.";
      setProfileMsg({ type: "error", text: message });
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  }, [form.name, form.email, form.phone, setUser, userId]);

  /* ---------- Password save ---------- */
  const onPasswordSave = useCallback(async () => {
    const errs = validatePassword();
    setPwdErrors(errs);
    setPwdMsg(null);
    if (Object.keys(errs).length) return;

    try {
      setSavingPwd(true);
      await api.put(`students/${userId}`, {
        current_password: pwd.current || undefined, // if backend verifies current password
        password: pwd.next,
      });

      setPwdMsg({ type: "success", text: "Password updated successfully." });
      toast.success("Password updated successfully.");
      setPwd((p) => ({ ...p, current: "", next: "", confirm: "" }));
    } catch (e) {
      const message = extractApiError(e) || "Could not update password.";
      setPwdMsg({ type: "error", text: message });
      toast.error(message);
    } finally {
      setSavingPwd(false);
    }
  }, [pwd.current, pwd.next, pwd.confirm, userId]);

  /* ---------- Delete account ---------- */
  const onDeleteAccount = useCallback(async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account? This cannot be undone.")) return;
    try {
      setDeleting(true);
      await api.delete(`students/${userId}`);
      toast.success("Account deleted.");
      // Clear local storage/session if needed
      localStorage.removeItem("userInfo");
      window.location.href = "/loginpage";
    } catch (e) {
      const msg = extractApiError(e) || "Could not delete the account. Please contact support.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  }, [userId]);

  const firstName = (user?.name || "Student").split(" ")[0];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex text-gray-800">
        <Suspense
          fallback={
            <div className="w-64 p-6">
              <div className="h-6 w-28 bg-slate-200 rounded animate-pulse mb-4" />
              <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
            </div>
          }
        >
          <Sidebar />
        </Suspense>

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
                  <h2 className="text-xl md:text-2xl font-semibold">Hey, {firstName}</h2>
                  <p className="text-white/90">Keep your information up to date and your account secure.</p>
                </div>
                <div
                  className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/20 font-bold"
                  aria-hidden
                >
                  {firstName?.[0] ?? "S"}
                </div>
              </div>
            </section>

            {/* Load error */}
            {loadError && (
              <div
                className="bg-white border border-red-200 text-red-700 rounded-2xl p-6 flex items-start gap-3 mb-8"
                role="alert"
                aria-live="polite"
              >
                <FaExclamationTriangle className="mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Could not load your profile</p>
                  <p className="text-sm mb-3">{loadError}</p>
                  <button
                    onClick={load}
                    className="inline-flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg"
                    aria-label="Retry loading profile"
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
                    inputProps={{ "aria-label": "Full name" }}
                  />
                  <Field
                    label="Email address"
                    icon={<FaEnvelope />}
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                    placeholder="name@example.com"
                    error={profileErrors.email}
                    inputProps={{ "aria-label": "Email address" }}
                  />
                  <Field
                    label="Phone"
                    icon={<FaPhone />}
                    value={form.phone}
                    onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                    placeholder="+1 555 000 1234"
                    error={profileErrors.phone}
                    inputProps={{ "aria-label": "Phone number" }}
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
                    aria-label="Save profile changes"
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
                  onToggleShow={() =>
                    setPwd((p) => ({ ...p, showCurrent: !p.showCurrent }))
                  }
                  placeholder="••••••••"
                />
                <PasswordField
                  label="New password"
                  value={pwd.next}
                  onChange={(v) => setPwd((p) => ({ ...p, next: v }))}
                  show={pwd.showNext}
                  onToggleShow={() =>
                    setPwd((p) => ({ ...p, showNext: !p.showNext }))
                  }
                  placeholder="At least 8 characters"
                  error={pwdErrors.next}
                />
                <PasswordField
                  label="Confirm new password"
                  value={pwd.confirm}
                  onChange={(v) => setPwd((p) => ({ ...p, confirm: v }))}
                  show={pwd.showConfirm}
                  onToggleShow={() =>
                    setPwd((p) => ({ ...p, showConfirm: !p.showConfirm }))
                  }
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
                    aria-label="Update password"
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
                <p className="text-sm text-gray-600 mb-4">
                  Delete your account and all associated data.
                </p>
                <button
                  onClick={onDeleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-sm disabled:opacity-60"
                  aria-label="Delete account"
                >
                  {deleting ? "Deleting..." : "Delete account"}
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

/* ---------- Small UI components ---------- */
function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  inputProps = {},
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 border rounded-lg px-3 py-2 bg-white ${
          error ? "border-red-300" : "border-gray-200"
        }`}
      >
        <span className="text-gray-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full outline-none text-sm"
          {...inputProps}
        />
      </div>
      {error ? <div className="text-xs text-red-600 mt-1">{error}</div> : null}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  placeholder,
  error,
}) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 border rounded-lg px-3 py-2 bg-white ${
          error ? "border-red-300" : "border-gray-200"
        }`}
      >
        <FaLock className="text-gray-400" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full outline-none text-sm"
          aria-label={label}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="text-gray-400 hover:text-gray-600"
          aria-label={show ? "Hide password" : "Show password"}
        >
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
  const icon =
    tone === "success" ? (
      <FaCheckCircle aria-hidden />
    ) : (
      <FaExclamationTriangle aria-hidden />
    );
  return (
    <div
      className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm ${map[tone]} ${className}`}
      role="status"
      aria-live="polite"
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}