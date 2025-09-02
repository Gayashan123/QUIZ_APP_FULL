import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { apiurl } from "../../Admin/common/Http";
import Sidebar from "../component/Sidebar";

/* ---------------- Helpers ---------------- */
const normalizeBase = (base) => (typeof base === "string" ? base.replace(/\/+$/, "") + "/" : "/");
const API_ROOT = normalizeBase(apiurl);
const API_BASE = `${API_ROOT}quizzes`;

const resolveToken = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    return userInfo?.token || "";
  } catch {
    return "";
  }
};

const makeHeaders = () => {
  const h = new Headers();
  h.set("Accept", "application/json");
  h.set("Content-Type", "application/json");
  const tk = resolveToken();
  if (tk) h.set("Authorization", `Bearer ${tk}`);
  return h;
};

const fetchJSON = async (url, opts = {}) => {
  const res = await fetch(url, { ...opts, headers: makeHeaders() });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err?.message || err?.error || JSON.stringify(err);
    } catch {}
    throw new Error(message);
  }
  return res.json();
};

const parseDate = (v) => (v ? new Date(v) : null);
const fmt = (d) =>
  d
    ? new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(typeof d === "string" ? new Date(d) : d)
    : "-";

const statusOf = (quiz, now = new Date()) => {
  const start = parseDate(quiz?.start_time);
  const end = parseDate(quiz?.end_time);
  if (start && now < start) return "upcoming";
  if (start && end && now >= start && now <= end) return "ongoing";
  if (end && now > end) return "past";
  return "unknown";
};

/* ---------------- Component ---------------- */
export default function StudentQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchJSON(API_BASE);
      const list = Array.isArray(data) ? data : data?.data || [];
      setQuizzes(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load quizzes";
      setError(msg);
      toast.error(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAttempt = (quiz) => {
    if (!quiz?.id) {
      toast.error("Quiz ID missing!");
      return;
    }
    navigate(`/quiz/${quiz.id}/attempt`);
  };

  const now = useMemo(() => new Date(), [quizzes]);

  const filteredQuizzes = useMemo(() => {
    return quizzes
      .filter((q) => {
        if (statusFilter === "all") return true;
        return statusOf(q, now) === statusFilter;
      })
      .filter((q) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
          q?.quiz_title?.toLowerCase().includes(s) ||
          q?.subject?.name?.toLowerCase().includes(s)
        );
      })
      .sort(
        (a, b) =>
          (parseDate(b.start_time)?.getTime() || 0) -
          (parseDate(a.start_time)?.getTime() || 0)
      );
  }, [quizzes, search, statusFilter, now]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Available Quizzes
                </h1>
                <p className="text-slate-600">Browse and attempt quizzes assigned to you</p>
              </div>
              <button
                onClick={load}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm hover:shadow-md transition"
                disabled={loading}
              >
                <Icon.Refresh className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span className="text-sm font-medium">
                  {loading ? "Refreshing…" : "Refresh"}
                </span>
              </button>
            </header>

            <section className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-4 relative">
                <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="w-full rounded-2xl bg-white/80 backdrop-blur px-10 py-2 ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-400 outline-none transition"
                  placeholder="Search quizzes…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="md:col-span-3">
                <Segmented
                  label="Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "all", label: "All" },
                    { value: "ongoing", label: "Active" },
                    { value: "upcoming", label: "Upcoming" },
                    { value: "past", label: "Completed" },
                  ]}
                />
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : error ? (
                <div className="col-span-full rounded-3xl border border-red-200 bg-white/80 backdrop-blur p-4 text-red-700">
                  {error}
                </div>
              ) : filteredQuizzes.length === 0 ? (
                <div className="col-span-full rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-4 text-slate-700 text-center">
                  No quizzes found.
                </div>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <Card
                    key={quiz.id}
                    quiz={quiz}
                    now={now}
                    onAttempt={() => handleAttempt(quiz)}
                  />
                ))
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function Card({ quiz, now, onAttempt }) {
  const status = statusOf(quiz, now);
  const isAttempted = quiz.attempt_status === "completed";
  const score =
    quiz.score !== undefined ? `${quiz.score}/${quiz.total_marks}` : "Not graded";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {quiz.quiz_title}
          </h3>
          <p className="text-sm text-slate-600">{quiz.subject?.name || "-"}</p>
        </div>
        <Badge status={status} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Duration:</span>
          <span className="font-medium">{quiz.time_limit} minutes</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Passing Score:</span>
          <span className="font-medium">{quiz.passing_score}</span>
        </div>
        {isAttempted && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Your Score:</span>
            <span className="font-medium text-green-600">{score}</span>
          </div>
        )}
      </div>

      <div className="space-y-2 text-xs text-slate-500 mb-4">
        <div>Starts: {fmt(quiz.start_time)}</div>
        <div>Ends: {fmt(quiz.end_time)}</div>
      </div>

      <button
        onClick={onAttempt}
        disabled={status !== "ongoing" || isAttempted}
        className={`w-full py-2 rounded-xl font-medium transition ${
          status === "ongoing" && !isAttempted
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        {isAttempted
          ? "Attempted"
          : status === "ongoing"
          ? "Attempt Quiz"
          : status === "upcoming"
          ? "Not Started"
          : "Expired"}
      </button>
    </div>
  );
}

function Badge({ status }) {
  const statusConfig = {
    ongoing: { label: "Active", color: "bg-green-100 text-green-800 border-green-200" },
    upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-800 border-blue-200" },
    past: { label: "Completed", color: "bg-gray-100 text-gray-800 border-gray-200" },
    unknown: { label: "Unknown", color: "bg-gray-100 text-gray-800 border-gray-200" },
  };
  const config = statusConfig[status] || statusConfig.unknown;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function Segmented({ label, value, onChange, options }) {
  return (
    <div className="w-full">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="inline-flex w-full items-center rounded-2xl bg-slate-100 p-1">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`flex-1 px-3 py-1.5 rounded-xl text-sm transition ${
                active
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const Icon = {
  Search: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
    </svg>
  ),
  Refresh: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M5 19a8 8 0 0 0 14-5 8 8 0 0 0-8-8" />
    </svg>
  ),
};

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6 shadow-sm">
      <div className="h-6 w-3/4 bg-slate-200/70 rounded animate-pulse mb-4" />
      <div className="h-4 w-1/2 bg-slate-200/70 rounded animate-pulse mb-6" />
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-slate-200/70 rounded animate-pulse" />
        <div className="h-4 bg-slate-200/70 rounded animate-pulse" />
        <div className="h-4 bg-slate-200/70 rounded animate-pulse" />
      </div>
      <div className="h-8 bg-slate-200/70 rounded-xl animate-pulse" />
    </div>
  );
}