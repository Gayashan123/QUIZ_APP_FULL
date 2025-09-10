import React, { useEffect, useMemo, useState } from "react";
import {
  FiBook,
  FiUsers,
  FiBarChart2,
  FiDownload,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiCheck,
  FiXCircle,
  FiUser,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiClock,
  FiAward,
} from "react-icons/fi";
import { apiurl, token as tokenFromLS } from "../../Admin/common/Http";
import Sidebar from "../components/Sidebar";

/* ---------------- HTTP helpers ---------------- */
const normalizeBase = (base) =>
  typeof base === "string" ? base.replace(/\/+$/, "") + "/" : "/";
const API_ROOT = normalizeBase(apiurl);

const makeHeaders = () => {
  const h = new Headers();
  h.set("Accept", "application/json");
  h.set("Content-Type", "application/json");
  try {
    const t = typeof tokenFromLS === "function" ? tokenFromLS() : tokenFromLS;
    if (t) h.set("Authorization", `Bearer ${t}`);
  } catch {}
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

/* ---------------- UI components ---------------- */
const Card = ({ children, className = "", ...props }) => (
  <div
    className={`bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl shadow-blue-100/30 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-200/50 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const StatTile = ({ icon: Icon, label, value, sub }) => (
  <div className="rounded-2xl bg-white/80 backdrop-blur border border-black/5 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04),0_10px_24px_rgba(0,0,0,0.06)]">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white flex items-center justify-center">
        <Icon />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-2xl font-bold leading-tight">{value}</div>
        {sub ? <div className="text-xs text-slate-500 mt-1">{sub}</div> : null}
      </div>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

const ScoreBadge = ({ score }) => {
  if (score === null || score === undefined) return <span className="text-gray-500">—</span>;
  let colorClass = "";
  if (score >= 80) colorClass = "text-green-600 bg-green-100";
  else if (score >= 60) colorClass = "text-yellow-600 bg-yellow-100";
  else colorClass = "text-red-600 bg-red-100";
  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${colorClass}`}>
      {score}%
    </span>
  );
};

/* ---------------- Helpers ---------------- */
const safeDate = (d) => {
  try {
    return d ? new Date(d) : null;
  } catch {
    return null;
  }
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

const msBetween = (start, end) => {
  const s = safeDate(start)?.getTime();
  const e = (end ? safeDate(end) : new Date())?.getTime();
  if (!s || !e) return null;
  const diff = Math.max(0, e - s);
  return Number.isFinite(diff) ? diff : null;
};

const formatDuration = (ms) => {
  if (ms == null) return "—";
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/* ---------------- Normalizers ---------------- */
const normalizeQuiz = (q) => ({
  id: q.id ?? q.quiz_id ?? q.uuid,
  title: q.quiz_title || q.title || q.name || "Untitled Quiz",
  subject: q.subject?.name || q.subject_name || "—",
  createdAt: q.created_at || q.createdAt || q.start_time || q.start_at || null,
});

const normalizeParticipant = (r) => {
  // r is a StudentQuiz row with student relation
  const studentId = r.student_id ?? r.student?.id ?? r.user_id ?? r.id;
  const score = toNumber(
    r.score ?? r.percent ?? r.percentage ?? r.result?.score ?? r.result?.percent
  );
  const startedAt = r.started_at || r.startedAt || null;
  const finishedAt = r.finished_at || r.completed_at || r.submitted_at || null;
  const durationMs = msBetween(startedAt, finishedAt);
  return {
    key:
      r.id ||
      `${studentId}-${finishedAt || startedAt || Math.random().toString(36).slice(2)}`,
    studentId,
    name: r.student?.name || r.name || r.student_name || "Unknown Student",
    email: r.student?.email || r.email || "",
    score,
    startedAt,
    finishedAt,
    durationMs,
  };
};

/* ---------------- Main Component ---------------- */
export default function ViewAnalytics() {
  // Quizzes
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [query, setQuery] = useState("");
  const [quizDateFrom, setQuizDateFrom] = useState("");
  const [quizDateTo, setQuizDateTo] = useState("");
  const [sortBy, setSortBy] = useState("created_desc"); // created_desc | created_asc | title | subject

  // Participants state
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [studentsByQuiz, setStudentsByQuiz] = useState({});
  const [loadingStudents, setLoadingStudents] = useState({});
  // Per-quiz filters
  const [studentQuery, setStudentQuery] = useState({}); // { [quizId]: string }
  const [studentStatus, setStudentStatus] = useState({}); // { [quizId]: "all" | "completed" | "in_progress" }
  const [studentDateFrom, setStudentDateFrom] = useState({}); // { [quizId]: string }
  const [studentDateTo, setStudentDateTo] = useState({}); // { [quizId]: string }
  const [studentSortBy, setStudentSortBy] = useState({}); // { [quizId]: "score_desc" | "score_asc" | "name" | "completed_desc" }

  /* -------- Fetch quizzes -------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingQuizzes(true);
      setError(null);
      try {
        const data = await fetchJSON("quizzes");
        const list = Array.isArray(data) ? data : data?.data || [];
        const normalized = list.map(normalizeQuiz);
        if (mounted) setQuizzes(normalized);
      } catch (e) {
        console.error("Error fetching quizzes:", e);
        if (mounted) setError("Failed to load quizzes. Please try again.");
      } finally {
        if (mounted) setLoadingQuizzes(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* -------- Derived: filtered/sorted quizzes -------- */
  const filteredQuizzes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromTs = quizDateFrom ? new Date(quizDateFrom).getTime() : null;
    const toTs = quizDateTo ? new Date(quizDateTo).getTime() + 86399999 : null;

    let items = [...quizzes].filter((x) => {
      if (q) {
        const hay = `${x.title} ${x.subject}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const ts = x.createdAt ? new Date(x.createdAt).getTime() : null;
      if (fromTs && (!ts || ts < fromTs)) return false;
      if (toTs && (!ts || ts > toTs)) return false;
      return true;
    });

    switch (sortBy) {
      case "created_asc":
        items.sort(
          (a, b) =>
            (a.createdAt ? new Date(a.createdAt).getTime() : 0) -
            (b.createdAt ? new Date(b.createdAt).getTime() : 0)
        );
        break;
      case "title":
        items.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "subject":
        items.sort((a, b) => (a.subject || "—").localeCompare(b.subject || "—"));
        break;
      case "created_desc":
      default:
        items.sort(
          (a, b) =>
            (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
            (a.createdAt ? new Date(a.createdAt).getTime() : 0)
        );
        break;
    }
    return items;
  }, [quizzes, query, quizDateFrom, quizDateTo, sortBy]);

  /* -------- Fetch participants for a quiz -------- */
  const fetchQuizStudents = async (quizId) => {
    setLoadingStudents((s) => ({ ...s, [quizId]: true }));
    try {
      const data = await fetchJSON(`quizzes/${quizId}/students`);
      const items = Array.isArray(data) ? data : data?.data || [];
      const normalized = items.map(normalizeParticipant);
      setStudentsByQuiz((prev) => ({ ...prev, [quizId]: normalized }));
    } catch (e) {
      console.error("Error fetching quiz students:", e);
      setStudentsByQuiz((prev) => ({ ...prev, [quizId]: [] }));
    } finally {
      setLoadingStudents((s) => ({ ...s, [quizId]: false }));
    }
  };

  const toggleQuiz = async (quizId) => {
    setExpandedQuiz((prev) => (prev === quizId ? null : quizId));
    if (!studentsByQuiz[quizId]) {
      await fetchQuizStudents(quizId);
    }
  };

  /* -------- Participants derived per quiz (filters + sort) -------- */
  const getFilteredStudents = (quizId) => {
    const list = studentsByQuiz[quizId] || [];
    const q = (studentQuery[quizId] || "").trim().toLowerCase();
    const status = studentStatus[quizId] || "all";
    const df = studentDateFrom[quizId] ? new Date(studentDateFrom[quizId]).getTime() : null;
    const dt = studentDateTo[quizId] ? new Date(studentDateTo[quizId]).getTime() + 86399999 : null;

    let items = list.filter((s) => {
      if (q) {
        const hay = `${s.name} ${s.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (status === "completed" && !s.finishedAt) return false;
      if (status === "in_progress" && s.finishedAt) return false;

      const compTs = s.finishedAt ? new Date(s.finishedAt).getTime() : null;
      if (df && (!compTs || compTs < df)) return false;
      if (dt && (!compTs || compTs > dt)) return false;
      return true;
    });

    const srt = studentSortBy[quizId] || "completed_desc";
    switch (srt) {
      case "score_desc":
        items.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
        break;
      case "score_asc":
        items.sort((a, b) => (a.score ?? 9999) - (b.score ?? 9999));
        break;
      case "name":
        items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "completed_desc":
      default:
        items.sort(
          (a, b) =>
            (b.finishedAt ? new Date(b.finishedAt).getTime() : 0) -
            (a.finishedAt ? new Date(a.finishedAt).getTime() : 0)
        );
        break;
    }
    return items;
  };

  /* -------- Summary metrics -------- */
  const allParticipants = useMemo(
    () => Object.values(studentsByQuiz).flat(),
    [studentsByQuiz]
  );
  const overallAvg = useMemo(() => {
    const vals = allParticipants.map((p) => toNumber(p.score)).filter((n) => n != null);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [allParticipants]);

  /* -------- Export (per quiz) -------- */
  const exportCSV = (quizId, quizTitle) => {
    const rows = getFilteredStudents(quizId);
    const header = ["Student", "Email", "Score", "Completed", "Time Spent"];
    const body = rows.map((r) => [
      r.name || "",
      r.email || "",
      r.score ?? "",
      r.finishedAt ? new Date(r.finishedAt).toLocaleString() : "",
      formatDuration(r.durationMs),
    ]);
    const csv = [header, ...body]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(quizTitle || "quiz").replace(/[^a-z0-9]/gi, "_")}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40 text-slate-900 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="flex-1">
        {/* background blobs */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-blue-200/25 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-purple-200/25 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* Header + Filters */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Quiz Analytics
              </h1>
              <p className="text-slate-600 mt-1">
                Track performance, time spent, and participation across your quizzes.
              </p>
            </div>

            <Card className="w-full lg:w-auto">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search quizzes or subjects"
                    className="w-full md:w-72 rounded-xl pl-9 pr-3 py-2 bg-white/80 border border-black/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <FiFilter className="text-slate-500" />
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-slate-400" />
                      <input
                        type="date"
                        value={quizDateFrom}
                        onChange={(e) => setQuizDateFrom(e.target.value)}
                        className="rounded-xl px-3 py-2 bg-white/80 border border-black/5"
                        title="From"
                      />
                    </div>
                    <span className="text-slate-400">—</span>
                    <input
                      type="date"
                      value={quizDateTo}
                      onChange={(e) => setQuizDateTo(e.target.value)}
                      className="rounded-xl px-3 py-2 bg-white/80 border border-black/5"
                      title="To"
                    />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl px-3 py-2 bg-white/80 border border-black/5"
                    title="Sort by"
                  >
                    <option value="created_desc">Newest</option>
                    <option value="created_asc">Oldest</option>
                    <option value="title">Title</option>
                    <option value="subject">Subject</option>
                  </select>

                  {(quizDateFrom || quizDateTo || query) && (
                    <button
                      onClick={() => {
                        setQuery("");
                        setQuizDateFrom("");
                        setQuizDateTo("");
                        setSortBy("created_desc");
                      }}
                      className="text-sm text-slate-600 hover:text-slate-900"
                      title="Clear filters"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Summary tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatTile icon={FiBook} label="Total Quizzes" value={filteredQuizzes.length} />
            <StatTile
              icon={FiUsers}
              label="Participants"
              value={allParticipants.length}
              sub="Across loaded quizzes"
            />
            <StatTile icon={FiAward} label="Average Score" value={`${overallAvg}%`} sub="Overall" />
          </div>

          {/* Quizzes + Participants */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <FiBarChart2 className="mr-2 text-indigo-600" />
                  Your Quizzes
                </h2>
                {loadingQuizzes && <div className="text-sm text-slate-500">Loading…</div>}
              </div>

              {loadingQuizzes ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredQuizzes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FiBook className="mx-auto text-3xl mb-3 opacity-50" />
                  <p>No quizzes match your filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuizzes.map((quiz) => {
                    const isOpen = expandedQuiz === quiz.id;
                    const students = studentsByQuiz[quiz.id] || [];
                    const isLoading = !!loadingStudents[quiz.id];
                    const avg =
                      students.length > 0
                        ? Math.round(
                            students
                              .map((s) => s.score)
                              .filter((n) => n != null)
                              .reduce((a, b, _, arr) => a + b / arr.length, 0)
                          )
                        : null;

                    const fStudents = getFilteredStudents(quiz.id);

                    return (
                      <Card key={quiz.id} className="p-0 overflow-hidden">
                        <button
                          onClick={() => toggleQuiz(quiz.id)}
                          className="w-full text-left p-5 flex items-center justify-between hover:bg-white/60 transition-colors"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{quiz.title}</h3>
                            <div className="text-sm text-slate-600 flex items-center gap-4">
                              <span className="inline-flex items-center gap-1">
                                <FiBook /> {quiz.subject}
                              </span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                <FiCalendar /> {formatDate(quiz.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mr-2 text-sm text-slate-700">
                            {avg != null && (
                              <div className="hidden sm:flex items-center gap-2">
                                <span className="text-slate-600">Avg</span>
                                <ScoreBadge score={avg} />
                              </div>
                            )}
                            {students.length > 0 && (
                              <div className="flex items-center">
                                <FiUsers className="mr-1" />
                                <span>{students.length}</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-2">
                            {isOpen ? (
                              <FiChevronUp className="text-slate-500" />
                            ) : (
                              <FiChevronDown className="text-slate-500" />
                            )}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-5">
                            {/* Per-quiz filters */}
                            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input
                                    value={studentQuery[quiz.id] || ""}
                                    onChange={(e) =>
                                      setStudentQuery((prev) => ({
                                        ...prev,
                                        [quiz.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Search students"
                                    className="w-full rounded-xl pl-9 pr-3 py-2 bg-white/80 border border-black/5"
                                  />
                                </div>
                                <select
                                  value={studentStatus[quiz.id] || "all"}
                                  onChange={(e) =>
                                    setStudentStatus((prev) => ({
                                      ...prev,
                                      [quiz.id]: e.target.value,
                                    }))
                                  }
                                  className="rounded-xl px-3 py-2 bg-white/80 border border-black/5"
                                  title="Status"
                                >
                                  <option value="all">All</option>
                                  <option value="completed">Completed</option>
                                  <option value="in_progress">In Progress</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-2 justify-between md:justify-end">
                                <div className="flex items-center gap-2">
                                  <FiFilter className="text-slate-500" />
                                  <FiCalendar className="text-slate-400" />
                                  <input
                                    type="date"
                                    value={studentDateFrom[quiz.id] || ""}
                                    onChange={(e) =>
                                      setStudentDateFrom((prev) => ({
                                        ...prev,
                                        [quiz.id]: e.target.value,
                                      }))
                                    }
                                    className="rounded-xl px-3 py-2 bg-white/80 border border-black/5"
                                    title="Completed from"
                                  />
                                  <span className="text-slate-400">—</span>
                                  <input
                                    type="date"
                                    value={studentDateTo[quiz.id] || ""}
                                    onChange={(e) =>
                                      setStudentDateTo((prev) => ({
                                        ...prev,
                                        [quiz.id]: e.target.value,
                                      }))
                                    }
                                    className="rounded-xl px-3 py-2 bg-white/80 border border-black/5"
                                    title="Completed to"
                                  />
                                </div>

                                <select
                                  value={studentSortBy[quiz.id] || "completed_desc"}
                                  onChange={(e) =>
                                    setStudentSortBy((prev) => ({
                                      ...prev,
                                      [quiz.id]: e.target.value,
                                    }))
                                  }
                                  className="rounded-xl px-3 py-2 bg-white/80 border border-black/5"
                                  title="Sort participants"
                                >
                                  <option value="completed_desc">Newest Completed</option>
                                  <option value="score_desc">Score High → Low</option>
                                  <option value="score_asc">Score Low → High</option>
                                  <option value="name">Name (A-Z)</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-slate-700">
                                Participants {fStudents.length ? `(${fStudents.length})` : ""}
                              </h4>
                              <button
                                onClick={() => exportCSV(quiz.id, quiz.title)}
                                className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                <FiDownload /> Export CSV
                              </button>
                            </div>

                            {isLoading ? (
                              <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                            ) : students.length === 0 ? (
                              <div className="text-center py-4 text-slate-500">No participants yet.</div>
                            ) : fStudents.length === 0 ? (
                              <div className="text-center py-4 text-slate-500">
                                No participants match your filters.
                              </div>
                            ) : (
                              <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="min-w-full">
                                  <thead className="bg-slate-50">
                                    <tr>
                                      <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">
                                        Student
                                      </th>
                                      <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">
                                        Score
                                      </th>
                                      <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">
                                        Completed
                                      </th>
                                      <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">
                                        Time Spent
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200">
                                    {fStudents.map((student) => (
                                      <tr key={student.key} className="hover:bg-white/60">
                                        <td className="py-3 px-4">
                                          <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white flex items-center justify-center text-sm font-semibold">
                                              {(student.name || "S")
                                                .split(" ")
                                                .map((p) => p[0])
                                                .slice(0, 2)
                                                .join("")
                                                .toUpperCase()}
                                            </div>
                                            <div>
                                              <div className="font-medium">{student.name}</div>
                                              {student.email && (
                                                <div className="text-sm text-slate-500">{student.email}</div>
                                              )}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="py-3 px-4">
                                          <ScoreBadge score={student.score} />
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                          {student.finishedAt ? formatDate(student.finishedAt) : "—"}
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                          <span className="inline-flex items-center gap-1 text-slate-700">
                                            <FiClock /> {formatDuration(student.durationMs)}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}