import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  lazy,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/Auth";
import api from "../../Admin/common/api";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaFilter,
  FaChartLine,
  FaTrophy,
  FaBookOpen,
  FaUserGraduate,
  FaChevronRight,
  FaExclamationTriangle,
  FaSyncAlt,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaCrown,
  FaMedal,
  FaAward,
  FaLightbulb,
  FaRegLightbulb,
} from "react-icons/fa";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Lazy-load Sidebar
const Sidebar = lazy(() => import("../component/Sidebar"));

/* ---------------- Utils ---------------- */
const extractApiError = (e) =>
  e?.response?.data?.message ||
  e?.response?.data?.error ||
  (e?.response?.data?.errors
    ? Object.values(e.response.data.errors).flat().join(" ")
    : "") ||
  e?.message ||
  "Request failed";

function normalize(items) {
  return items.map((i) => {
    const quiz = i.quiz || {};
    const quizId = i.quiz_id ?? quiz.id ?? null;

    const title = quiz.quiz_title || quiz.title || "Untitled Quiz";
    const subjectName = quiz?.subject?.name || i?.quiz?.subject?.name || "General";
    const teacherName = quiz?.teacher?.name || i?.quiz?.teacher?.name || "Teacher";

    const score =
      typeof i.score === "number"
        ? i.score
        : typeof i.result?.score === "number"
        ? i.result.score
        : null;
    const totalScore = i.total_score ?? i.result?.total ?? 100;
    const scorePercent =
      typeof score === "number" ? Math.round((score / totalScore) * 100) : null;

    const finishedAtTs = i.finished_at ? new Date(i.finished_at).getTime() : null;
    const finishedAt = i.finished_at
      ? new Date(i.finished_at).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

    const status = (i.status || (i.finished ? "completed" : "")).toLowerCase() || "completed";

    return {
      id: i.id ?? quizId,
      quizId,
      title,
      subjectName,
      teacherName,
      scorePercent: scorePercent ?? 0,
      finishedAt,
      finishedAtTs,
      status,
    };
  });
}

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
export default function AnalyticsPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [error, setError] = useState(null);

  // UI controls
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("all"); // all, month, week

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    try {
      // 1) Fetch student attempts
      const res = await api.get(`students/${user.id}/quizzes`);
      const base = Array.isArray(res.data) ? res.data : res?.data?.data ?? res?.data ?? [];

      // 2) Hydrate missing quiz details (subject, teacher, title) if needed
      const ids = Array.from(
        new Set(base.map((x) => x.quiz_id || x?.quiz?.id).filter(Boolean))
      );

      const detailsMap = {};
      if (ids.length) {
        await Promise.all(
          ids.map(async (qid) => {
            try {
              const qRes = await api.get(`quizzes/${qid}`);
              detailsMap[qid] = qRes?.data?.data ?? qRes?.data ?? null;
            } catch {
              // ignore individual quiz fetch errors
            }
          })
        );
      }

      const enriched = base.map((item) => {
        const quiz =
          item.quiz ||
          detailsMap[item.quiz_id] ||
          (item.quiz?.id ? detailsMap[item.quiz.id] : null) ||
          null;
        return { ...item, quiz };
      });

      const normalized = normalize(enriched);
      setAttempts(normalized);
    } catch (e) {
      const msg = extractApiError(e) || "Unable to load analytics. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  // Filter by time range
  const filteredByTime = useMemo(() => {
    const now = new Date();
    let cutoffDate = new Date(0);

    if (timeRange === "month") {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      cutoffDate = d;
    } else if (timeRange === "week") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      cutoffDate = d;
    }

    return attempts.filter(
      (a) => a.finishedAtTs && a.finishedAtTs >= cutoffDate.getTime()
    );
  }, [attempts, timeRange]);

  // Completed attempts only
  const completed = useMemo(
    () => filteredByTime.filter((a) => a.status === "completed"),
    [filteredByTime]
  );

  // Subjects list for filter
  const subjects = useMemo(
    () => ["all", ...Array.from(new Set(completed.map((a) => a.subjectName)))],
    [completed]
  );

  // Search + Subject filter + Most recent
  const filtered = useMemo(() => {
    let list = completed;

    if (subjectFilter !== "all") {
      list = list.filter((a) => a.subjectName === subjectFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subjectName.toLowerCase().includes(q) ||
          a.teacherName.toLowerCase().includes(q)
      );
    }
    return list.slice().sort((a, b) => (b.finishedAtTs || 0) - (a.finishedAtTs || 0));
  }, [completed, subjectFilter, query]);

  // Analytics calculations
  const analytics = useMemo(() => {
    if (!completed.length) {
      return {
        total: 0,
        avg: 0,
        best: 0,
        worst: 0,
        subjectsCount: 0,
        trendScores: [],
        gradeDist: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        bySubject: [],
        improvement: 0,
        consistency: 0,
        strengths: [],
        weaknesses: [],
        trendData: [],
      };
    }

    const scores = completed
      .map((a) => a.scorePercent)
      .filter((x) => typeof x === "number");

    const avg = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const best = scores.length ? Math.max(...scores) : 0;
    const worst = scores.length ? Math.min(...scores) : 0;

    const sortedByDate = completed
      .slice()
      .sort((a, b) => (a.finishedAtTs || 0) - (b.finishedAtTs || 0));

    const half = Math.floor(sortedByDate.length / 2);
    const firstHalfAvg =
      half > 0
        ? Math.round(
            sortedByDate
              .slice(0, half)
              .reduce((sum, a) => sum + (a.scorePercent || 0), 0) / half
          )
        : 0;
    const secondHalfAvg =
      sortedByDate.length - half > 0
        ? Math.round(
            sortedByDate
              .slice(half)
              .reduce((sum, a) => sum + (a.scorePercent || 0), 0) /
              (sortedByDate.length - half)
          )
        : 0;

    const improvement = firstHalfAvg > 0 ? secondHalfAvg - firstHalfAvg : 0;

    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) /
      scores.length;
    const consistency = Math.max(0, Math.min(100, Math.round(100 - (Math.sqrt(variance) / 100) * 100)));

    const trendScores = sortedByDate.map((x) => x.scorePercent ?? 0);

    const gradeDist = {
      A: scores.filter((s) => s >= 90).length,
      B: scores.filter((s) => s >= 80 && s < 90).length,
      C: scores.filter((s) => s >= 70 && s < 80).length,
      D: scores.filter((s) => s >= 60 && s < 70).length,
      F: scores.filter((s) => s < 60).length,
    };

    const map = new Map();
    for (const a of completed) {
      if (typeof a.scorePercent !== "number") continue;
      const key = a.subjectName || "General";
      const entry =
        map.get(key) || {
          subject: key,
          total: 0,
          count: 0,
          best: 0,
          worst: 100,
        };
      entry.total += a.scorePercent;
      entry.count += 1;
      entry.best = Math.max(entry.best, a.scorePercent);
      entry.worst = Math.min(entry.worst, a.scorePercent);
      map.set(key, entry);
    }

    const bySubject = Array.from(map.values())
      .map((e) => ({
        subject: e.subject,
        avg: Math.round(e.total / e.count),
        best: e.best,
        worst: e.worst,
        count: e.count,
      }))
      .sort((a, b) => b.avg - a.avg);

    const strengths = bySubject.filter((s) => s.avg >= 80).slice(0, 3);
    const weaknesses = bySubject.filter((s) => s.avg < 70).slice(0, 3);

    return {
      total: completed.length,
      avg,
      best,
      worst,
      subjectsCount: bySubject.length,
      trendScores,
      gradeDist,
      bySubject,
      improvement,
      consistency,
      strengths,
      weaknesses,
      trendData: sortedByDate.map((a, i) => ({
        name: `Quiz ${i + 1}`,
        score: a.scorePercent,
        date: a.finishedAt,
        subject: a.subjectName,
      })),
    };
  }, [completed]);

  const firstName = (user?.name || "Student").split(" ")[0];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  const GRADE_COLORS = {
    A: "#10B981",
    B: "#3B82F6",
    C: "#F59E0B",
    D: "#F97316",
    F: "#EF4444",
  };

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
          {/* Top bar */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder="Search by quiz title, subject, or teacher..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  aria-label="Search attempts"
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                  <FaFilter className="text-gray-500" aria-hidden />
                  <label className="sr-only" htmlFor="subjectFilter">
                    Subject filter
                  </label>
                  <select
                    id="subjectFilter"
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="bg-transparent text-sm outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s === "all" ? "All subjects" : s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                  <FaCalendarAlt className="text-gray-500" aria-hidden />
                  <label className="sr-only" htmlFor="timeRange">
                    Time range
                  </label>
                  <select
                    id="timeRange"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-transparent text-sm outline-none"
                  >
                    <option value="all">All Time</option>
                    <option value="month">Last Month</option>
                    <option value="week">Last Week</option>
                  </select>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 md:p-8">
            {/* Header banner */}
            <section className="mb-8">
              <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    Performance Analytics, {firstName}
                  </h1>
                  <p className="text-white/90">
                    Deep insights into your learning progress and areas for improvement.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <KpiPill icon={<FaChartLine />} label="Avg" value={`${analytics.avg}%`} />
                  <KpiPill icon={<FaTrophy />} label="Best" value={`${analytics.best}%`} />
                  {analytics.improvement !== 0 && (
                    <KpiPill
                      icon={analytics.improvement > 0 ? <FaArrowUp /> : <FaArrowDown />}
                      label="Trend"
                      value={`${analytics.improvement > 0 ? "+" : ""}${analytics.improvement}%`}
                    />
                  )}
                </div>
              </div>
            </section>

            {/* Performance Overview */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KpiCard
                title="Completed Quizzes"
                value={analytics.total}
                hint="Total quizzes finished"
                trend={analytics.total > 0 ? "positive" : "neutral"}
              />
              <KpiCard
                title="Average Score"
                value={`${analytics.avg}%`}
                hint="Across all completed"
                trend={analytics.avg >= 70 ? "positive" : "negative"}
              />
              <KpiCard
                title="Best Score"
                value={`${analytics.best}%`}
                hint="Your personal best"
                trend="positive"
              />
              <KpiCard
                title="Consistency"
                value={`${analytics.consistency}%`}
                hint="Score stability"
                trend={analytics.consistency >= 80 ? "positive" : "neutral"}
              />
            </section>

            {/* Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Performance Trend */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 col-span-1 lg:col-span-2">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <FaChartLine className="text-indigo-600" /> Performance Trend
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analytics.trendData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Score"]}
                        labelFormatter={(value, payload) =>
                          payload && payload.length
                            ? `Quiz: ${payload[0].payload.name}`
                            : value
                        }
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#6366F1"
                        strokeWidth={3}
                        activeDot={{ r: 8 }}
                        name="Score (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Grade Distribution */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <FaAward className="text-amber-600" /> Grade Distribution
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "A (90-100%)", value: analytics.gradeDist.A, color: GRADE_COLORS.A },
                          { name: "B (80-89%)", value: analytics.gradeDist.B, color: GRADE_COLORS.B },
                          { name: "C (70-79%)", value: analytics.gradeDist.C, color: GRADE_COLORS.C },
                          { name: "D (60-69%)", value: analytics.gradeDist.D, color: GRADE_COLORS.D },
                          { name: "F (<60%)", value: analytics.gradeDist.F, color: GRADE_COLORS.F },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {[
                          { name: "A (90-100%)", value: analytics.gradeDist.A, color: GRADE_COLORS.A },
                          { name: "B (80-89%)", value: analytics.gradeDist.B, color: GRADE_COLORS.B },
                          { name: "C (70-79%)", value: analytics.gradeDist.C, color: GRADE_COLORS.C },
                          { name: "D (60-69%)", value: analytics.gradeDist.D, color: GRADE_COLORS.D },
                          { name: "F (<60%)", value: analytics.gradeDist.F, color: GRADE_COLORS.F },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} quizzes`, "Count"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Subject Performance */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <FaBookOpen className="text-green-600" /> Subject Performance
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.bySubject.slice(0, 5)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="subject" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, "Average Score"]} />
                      <Legend />
                      <Bar
                        dataKey="avg"
                        name="Average Score (%)"
                        fill="#6366F1"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* Insights Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Strengths */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <FaLightbulb className="text-green-600" /> Your Strengths
                </h3>
                {analytics.strengths.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.strengths.map((subject, index) => (
                      <div
                        key={subject.subject}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <FaCrown className="text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">{subject.subject}</div>
                            <div className="text-sm text-green-600">Average: {subject.avg}%</div>
                          </div>
                        </div>
                        <div className="text-green-800 font-semibold">#{index + 1}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    <FaRegLightbulb className="text-3xl mx-auto mb-2 text-gray-400" />
                    <p>Complete more quizzes to identify your strengths</p>
                  </div>
                )}
              </div>

              {/* Areas for Improvement */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <FaRegLightbulb className="text-amber-600" /> Areas for Improvement
                </h3>
                {analytics.weaknesses.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.weaknesses.map((subject) => (
                      <div
                        key={subject.subject}
                        className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <FaMedal className="text-amber-600" />
                          </div>
                          <div>
                            <div className="font-medium">{subject.subject}</div>
                            <div className="text-sm text-amber-600">Average: {subject.avg}%</div>
                          </div>
                        </div>
                        <div className="text-amber-800 font-semibold">Focus Needed</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    <FaLightbulb className="text-3xl mx-auto mb-2 text-gray-400" />
                    <p>Great job! No major weaknesses detected</p>
                  </div>
                )}
              </div>
            </section>

            {/* Table of attempts */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Your Quiz History</h2>
                <span className="text-sm text-gray-500">Sorted by most recent</span>
              </div>

              {loading ? (
                <TableSkeleton />
              ) : error ? (
                <ErrorState error={error} />
              ) : filtered.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <Th>Quiz</Th>
                        <Th>Subject</Th>
                        <Th>Teacher</Th>
                        <Th className="text-center">Score</Th>
                        <Th>Finished</Th>
                        <Th></Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <Td>
                            <div className="font-medium text-gray-900">{a.title}</div>
                            <div className="text-xs text-gray-500">ID: {a.quizId}</div>
                          </Td>
                          <Td>
                            <div className="flex items-center gap-2">
                              <FaBookOpen className="text-gray-400" />
                              <span>{a.subjectName}</span>
                            </div>
                          </Td>
                          <Td>
                            <div className="flex items-center gap-2">
                              <FaUserGraduate className="text-gray-400" />
                              <span>{a.teacherName}</span>
                            </div>
                          </Td>
                          <Td className="text-center">
                            <ScoreBadge value={a.scorePercent} />
                          </Td>
                          <Td>
                            <div className="flex items-center gap-2 text-gray-600">
                              <FaCalendarAlt className="text-gray-400" />
                              <span>{a.finishedAt || "—"}</span>
                            </div>
                          </Td>
                          <Td className="text-right">
                            <button
                              onClick={() => navigate(`/quiz/${a.quizId}/review`)}
                              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              Review <FaChevronRight size={12} />
                            </button>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

/* ---------- Small UI pieces ---------- */
function KpiPill({ icon, label, value }) {
  return (
    <div className="bg-white/20 text-white rounded-full px-3 py-1.5 flex items-center gap-2">
      <span className="text-sm">{icon}</span>
      <span className="text-sm">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function KpiCard({ title, value, hint, trend }) {
  const trendColor =
    trend === "positive"
      ? "text-green-600"
      : trend === "negative"
      ? "text-red-600"
      : "text-gray-400";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-500">{title}</div>
        {trend && (
          <div className={trendColor}>
            {trend === "positive" ? (
              <FaArrowUp />
            ) : trend === "negative" ? (
              <FaArrowDown />
            ) : null}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-10 bg-gray-100 rounded mb-2"></div>
      ))}
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="bg-white border border-red-200 text-red-700 rounded-2xl p-6 flex items-start gap-4">
      <FaExclamationTriangle className="text-red-600 mt-0.5" />
      <div>
        <p className="font-semibold mb-1">Something went wrong</p>
        <p className="text-sm mb-3">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FaSyncAlt /> Retry
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
      <div className="text-5xl mb-4">📉</div>
      <p className="font-semibold text-lg mb-1">No analytics yet</p>
      <p className="text-sm text-gray-600 max-w-md mx-auto">
        Complete some quizzes to see your analytics here.
      </p>
    </div>
  );
}

function ScoreBadge({ value }) {
  const color =
    value >= 90
      ? "bg-green-100 text-green-700"
      : value >= 80
      ? "bg-blue-100 text-blue-700"
      : value >= 70
      ? "bg-amber-100 text-amber-700"
      : value >= 60
      ? "bg-orange-100 text-orange-700"
      : "bg-red-100 text-red-700";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
      {value}%
    </span>
  );
}