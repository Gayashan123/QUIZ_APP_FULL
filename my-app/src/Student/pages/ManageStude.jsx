import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  lazy,
  Suspense,
} from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../Admin/common/api";

// Lazy-load Sidebar
const Sidebar = lazy(() => import("../component/Sidebar"));

/* ---------------- Helpers ---------------- */
const extractApiError = (e) =>
  e?.response?.data?.message ||
  e?.response?.data?.error ||
  (e?.response?.data?.errors
    ? Object.values(e.response.data.errors).flat().join(" ")
    : "") ||
  e?.message ||
  "Request failed";

const getStudentId = () => {
  try {
    const u = JSON.parse(localStorage.getItem("userInfo"));
    return u?.id || u?.user?.id || null;
  } catch {
    return null;
  }
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
  const start = parseDate(quiz?.start_time || quiz?.start_at);
  const end = parseDate(quiz?.end_time || quiz?.end_at);
  if (start && now < start) return "upcoming";
  if (start && end && now >= start && now <= end) return "ongoing";
  if (end && now > end) return "past";
  return "unknown";
};

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
        <div className="p-4 m-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700">
          Something went wrong. Please refresh the page.
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------------- Main Component ---------------- */
export default function StudentQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [attemptsMap, setAttemptsMap] = useState({}); // quizId -> attempt
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch quizzes
      const { data } = await api.get("quizzes");
      const list = Array.isArray(data) ? data : data?.data || [];
      setQuizzes(list);

      // Fetch attempts for current student
      const sid = getStudentId();
      if (sid) {
        const res = await api.get(`students/${sid}/quizzes`);
        const rows = Array.isArray(res.data)
          ? res.data
          : res.data?.data || res.data?.attempts || [];
        const map = {};
        for (const r of rows) {
          const qid = r.quiz_id ?? r.quiz?.id;
          if (qid != null) map[qid] = r;
        }
        setAttemptsMap(map);
      }
    } catch (e) {
      const msg = extractApiError(e) || "Failed to load quizzes";
      setError(msg);
      toast.error(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAttempt = (quiz) => {
    if (!quiz?.id) {
      toast.error("Quiz ID missing!");
      return;
    }
    navigate(`/quiz/${quiz.id}/login`);
  };

  const handleViewResult = (quiz) => {
    if (!quiz?.id) return;
    navigate(`/quiz/${quiz.id}/review`);
  };

  const now = useMemo(() => new Date(), [quizzes]);

  const filteredQuizzes = useMemo(() => {
    return quizzes
      .filter((q) =>
        statusFilter === "all" ? true : statusOf(q, now) === statusFilter
      )
      .filter((q) => {
        if (!search) return true;
        const s = search.toLowerCase();
        const title = (q?.quiz_title || q?.title || "").toLowerCase();
        const subject = (q?.subject?.name || "").toLowerCase();
        return title.includes(s) || subject.includes(s);
      })
      .sort(
        (a, b) =>
          (parseDate(b.start_time || b.start_at)?.getTime() || 0) -
          (parseDate(a.start_time || a.start_at)?.getTime() || 0)
      );
  }, [quizzes, search, statusFilter, now]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="flex">
          {/* Sidebar (lazy) */}
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

          {/* Main */}
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Available Quizzes
                  </h1>
                  <p className="text-slate-600">
                    Browse and attempt quizzes assigned to you
                  </p>
                </div>
                <button
                  onClick={load}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm hover:shadow-md transition disabled:opacity-60"
                  disabled={loading}
                  aria-label="Refresh list"
                >
                  <Icon.Refresh className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  <span className="text-sm font-medium">
                    {loading ? "Refreshing…" : "Refresh"}
                  </span>
                </button>
              </header>

              <section
                className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-3"
                aria-label="Filters"
              >
                <div className="md:col-span-4 relative">
                  <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="w-full rounded-2xl bg-white/80 backdrop-blur px-10 py-2 ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-400 outline-none transition"
                    placeholder="Search quizzes…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search quizzes"
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
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      now={now}
                      attempt={attemptsMap[quiz.id]}
                      onAttempt={() => handleAttempt(quiz)}
                      onViewResult={() => handleViewResult(quiz)}
                    />
                  ))
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

/* ---------------- Presentational ---------------- */
function QuizCard({ quiz, now, attempt, onAttempt, onViewResult }) {
  const status = statusOf(quiz, now);
  const isCompleted = attempt?.finished === true;
  const scoreText = attempt?.score != null ? `${attempt.score}/100` : "Not graded";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {quiz.quiz_title || quiz.title || "Untitled Quiz"}
          </h3>
          <p className="text-sm text-slate-600">{quiz.subject?.name || "-"}</p>
        </div>
        <Badge status={isCompleted ? "past" : status} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Duration:</span>
          <span className="font-medium">{quiz.time_limit ?? quiz.duration_minutes ?? "-"} minutes</span>
        </div>
        {quiz.passing_score != null && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Passing Score:</span>
            <span className="font-medium">{quiz.passing_score}</span>
          </div>
        )}
        {isCompleted && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Your Score:</span>
            <span className="font-medium text-emerald-600">{scoreText}</span>
          </div>
        )}
      </div>

      <div className="space-y-2 text-xs text-slate-500 mb-4">
        <div>Starts: {fmt(quiz.start_time || quiz.start_at)}</div>
        <div>Ends: {fmt(quiz.end_time || quiz.end_at)}</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onAttempt}
          disabled={status !== "ongoing" || isCompleted}
          className={`flex-1 py-2 rounded-xl font-medium transition ${
            status === "ongoing" && !isCompleted
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
          aria-label="Attempt quiz"
        >
          {isCompleted
            ? "Completed"
            : status === "ongoing"
            ? "Attempt Quiz"
            : status === "upcoming"
            ? "Not Started"
            : "Expired"}
        </button>

        {isCompleted && (
          <button
            onClick={onViewResult}
            className="flex-1 py-2 rounded-xl font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transition"
            aria-label="See result"
          >
            See Result
          </button>
        )}
      </div>
    </div>
  );
}

function Badge({ status }) {
  const statusConfig = {
    ongoing: {
      label: "Active",
      color: "bg-green-100 text-green-800 border-green-200",
    },
    upcoming: {
      label: "Upcoming",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    past: {
      label: "Completed",
      color: "bg-gray-100 text-gray-800 border-gray-200",
    },
    unknown: {
      label: "Unknown",
      color: "bg-gray-100 text-gray-800 border-gray-200",
    },
  };
  const config = statusConfig[status] || statusConfig.unknown;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}

function Segmented({ label, value, onChange, options }) {
  return (
    <div className="w-full" role="group" aria-label={label}>
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
              role="radio"
              aria-checked={active}
              aria-label={opt.label}
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
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
      />
    </svg>
  ),
  Refresh: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v6h6M20 20v-6h-6M5 19a8 8 0 0 0 14-5 8 8 0 0 0-8-8"
      />
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