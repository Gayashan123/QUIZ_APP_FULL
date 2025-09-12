import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  lazy,
  Suspense,
} from "react";
import { toast } from "react-toastify";
import api from "../../Admin/common/api";

// Lazy-load the sidebar for faster initial paint
const Sidebar = lazy(() => import("../components/Sidebar"));

/* ========================= Utilities ========================= */
const parseDate = (v) => (v ? new Date(v) : null);
const fmt = (d) => {
  if (!d) return "—";
  try {
    const date = typeof d === "string" ? new Date(d) : d;
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return String(d);
  }
};

// Convert date to local datetime string for input[type="datetime-local"]
const toLocalDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${y}-${m}-${d}T${h}:${min}`;
};

const statusOf = (quiz, now = new Date()) => {
  const start = parseDate(quiz?.start_time || quiz?.start_at || quiz?.start);
  const end = parseDate(quiz?.end_time || quiz?.end_at || quiz?.end);
  if (start && now < start) return "upcoming";
  if (start && end && now >= start && now <= end) return "ongoing";
  if (end && now > end) return "past";
  return "unknown";
};

const extractApiError = (error) => {
  const data = error?.response?.data;
  if (data) {
    if (typeof data === "string") return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.errors) {
      try {
        return Object.values(data.errors).flat().join(" ");
      } catch {
        return "Validation failed";
      }
    }
  }
  return error?.message || "Request failed";
};

/* ========================= Error Boundary ========================= */
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
        <div className="p-6 text-red-700 bg-red-50 border border-red-200 rounded-2xl">
          Something went wrong. Please refresh the page.
        </div>
      );
    }
    return this.props.children;
  }
}

/* ========================= Component ========================= */
export default function ManageQuiz() {
  // Data
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Busy state for per-row actions
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingDates, setEditingDates] = useState({});

  // Filters / UI state
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(""); // yyyy-mm-dd
  const [dateTo, setDateTo] = useState(""); // yyyy-mm-dd
  const [statusFilter, setStatusFilter] = useState("all"); // all|upcoming|ongoing|past
  const [sortBy, setSortBy] = useState("start_time"); // start_time|end_time|created_at|name
  const [sortAsc, setSortAsc] = useState(true);

  // Teacher name for Sidebar (safe fallback)
  const teacherName = useMemo(() => {
    try {
      const raw = localStorage.getItem("userInfo");
      if (raw) {
        const obj = JSON.parse(raw);
        const name =
          obj?.name ||
          obj?.user?.name ||
          `${obj?.first_name || ""} ${obj?.last_name || ""}`.trim();
        return name || "Teacher";
      }
    } catch {}
    return "Teacher";
  }, []);

  const RESOURCE = "quizzes";

  // Fetch list
  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data } = await api.get(RESOURCE);
      const list = Array.isArray(data) ? data : data?.data || [];
      setQuizzes(list);
    } catch (e) {
      const msg = extractApiError(e);
      setErrorMsg(msg);
      toast.error(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Actions
  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Delete this quiz? This cannot be undone.")) return;
      setDeletingId(id);
      try {
        await api.delete(`${RESOURCE}/${id}`);
        toast.success("Quiz deleted");
        await load();
      } catch (e) {
        toast.error(`Delete failed: ${extractApiError(e)}`);
      } finally {
        setDeletingId(null);
      }
    },
    [load]
  );

  const startEditing = useCallback((quiz) => {
    setEditingId(quiz.id);
    setEditingDates({
      start_time: toLocalDateTime(quiz.start_time || quiz.start_at),
      end_time: toLocalDateTime(quiz.end_time || quiz.end_at),
    });
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditingDates({});
  }, []);

  const handleDateChange = useCallback((field, value) => {
    setEditingDates((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const saveDateChanges = useCallback(
    async (quizId) => {
      try {
        const updates = {};
        if (editingDates.start_time) {
          updates.start_time = new Date(editingDates.start_time).toISOString();
        }
        if (editingDates.end_time) {
          updates.end_time = new Date(editingDates.end_time).toISOString();
        }
        await api.put(`${RESOURCE}/${quizId}`, updates);
        toast.success("Quiz dates updated");
        setEditingId(null);
        setEditingDates({});
        await load();
      } catch (e) {
        toast.error(`Update failed: ${extractApiError(e)}`);
      }
    },
    [editingDates, load]
  );

  // Derived
  const now = useMemo(() => new Date(), [quizzes]);
  const stats = useMemo(() => {
    const total = quizzes.length;
    const ongoing = quizzes.filter((q) => statusOf(q, now) === "ongoing").length;
    const upcoming = quizzes.filter((q) => statusOf(q, now) === "upcoming").length;
    return { total, ongoing, upcoming };
  }, [quizzes, now]);

  const filteredSorted = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    const withinRange = (q) => {
      const baseDate =
        parseDate(q.start_time || q.start_at || q.created_at || q.createdAt) ||
        null;
      if (!from && !to) return true;
      if (from && baseDate && baseDate < from) return false;
      if (to && baseDate && baseDate > to) return false;
      return true;
    };

    const matchesStatus = (q) => {
      if (statusFilter === "all") return true;
      return statusOf(q, now) === statusFilter;
    };

    const matchesSearch = (q) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        q?.name?.toLowerCase?.().includes(s) ||
        q?.quiz_title?.toLowerCase?.().includes(s) ||
        q?.title?.toLowerCase?.().includes(s) ||
        String(q?.id || "").includes(s)
      );
    };

    const list = quizzes
      .filter(withinRange)
      .filter(matchesStatus)
      .filter(matchesSearch)
      .sort((a, b) => {
        const get = (q) => {
          switch (sortBy) {
            case "name":
              return (q?.name || q?.quiz_title || q?.title || "").toLowerCase();
            case "end_time":
              return parseDate(q?.end_time || q?.end_at)?.getTime() || 0;
            case "created_at":
              return parseDate(q?.created_at || q?.createdAt)?.getTime() || 0;
            case "start_time":
            default:
              return parseDate(q?.start_time || q?.start_at)?.getTime() || 0;
          }
        };
        const A = get(a);
        const B = get(b);
        if (A < B) return sortAsc ? -1 : 1;
        if (A > B) return sortAsc ? 1 : -1;
        return 0;
      });

    return list;
  }, [quizzes, search, dateFrom, dateTo, statusFilter, sortBy, sortAsc, now]);

  /* ========================= UI (with Sidebar) ========================= */
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="flex">
          {/* Left Sidebar (lazy loaded) */}
          <Suspense
            fallback={
              <div className="w-64 p-6">
                <div className="h-6 w-28 bg-slate-200 rounded animate-pulse mb-4" />
                <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
              </div>
            }
          >
            <Sidebar teacherName={teacherName} />
          </Suspense>

          {/* Main content */}
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Header */}
              <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Manage Quizzes
                    </h1>
                    <p className="text-slate-600">
                      Search, update schedules, and delete quizzes.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={load}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm hover:shadow-md transition"
                      disabled={loading}
                      aria-label="Refresh list"
                    >
                      <Icon.Refresh
                        className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                      />
                      <span className="text-sm font-medium">
                        {loading ? "Refreshing…" : "Refresh"}
                      </span>
                    </button>
                  </div>
                </div>
              </header>

              {/* Stats */}
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatCard label="Total" value={stats.total} />
                <StatCard label="Upcoming" value={stats.upcoming} />
                <StatCard label="Ongoing" value={stats.ongoing} />
              </section>

              {/* Filters */}
              <section
                className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-3"
                aria-label="Filters"
              >
                {/* Search */}
                <div className="md:col-span-3 relative">
                  <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="w-full rounded-2xl bg-white/80 backdrop-blur px-10 py-2 ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-400 outline-none transition"
                    placeholder="Search by title or ID…"
                    aria-label="Search quizzes"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Date range */}
                <div className="md:col-span-4 grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Icon.Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      className="w-full rounded-2xl bg-white/80 backdrop-blur px-10 py-2 ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-400 outline-none transition"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      aria-label="From date"
                    />
                  </div>
                  <div className="relative">
                    <Icon.Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      className="w-full rounded-2xl bg-white/80 backdrop-blur px-10 py-2 ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-400 outline-none transition"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      aria-label="To date"
                    />
                  </div>
                </div>

                {/* Status segmented */}
                <div className="md:col-span-3">
                  <Segmented
                    label="Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: "all", label: "All" },
                      { value: "upcoming", label: "Upcoming" },
                      { value: "ongoing", label: "Ongoing" },
                      { value: "past", label: "Past" },
                    ]}
                  />
                </div>

                {/* Sort controls */}
                <div className="md:col-span-0 md:col-start-12 flex items-center justify-end gap-2">
                  <label className="sr-only" htmlFor="sortby">
                    Sort by
                  </label>
                  <select
                    id="sortby"
                    className="rounded-2xl bg-white/80 backdrop-blur px-3 py-2 ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-400 outline-none text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    title="Sort by"
                  >
                    <option value="start_time">Start time</option>
                    <option value="end_time">End time</option>
                    <option value="created_at">Created</option>
                    <option value="name">Name</option>
                  </select>
                  <button
                    className="inline-flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur px-2.5 py-2 ring-1 ring-slate-200 hover:ring-slate-300 transition"
                    onClick={() => setSortAsc((s) => !s)}
                    title="Toggle sort order"
                    aria-label="Toggle sort order"
                    aria-pressed={sortAsc}
                  >
                    {sortAsc ? (
                      <Icon.SortAsc className="h-4 w-4" />
                    ) : (
                      <Icon.SortDesc className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </section>

              {/* Desktop Table */}
              <section className="hidden md:block bg-white/80 backdrop-blur border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/70 backdrop-blur sticky top-0 z-10">
                      <tr>
                        <Th>Title</Th>
                        <Th>Schedule</Th>
                        <Th>Status</Th>
                        <Th className="text-right">Actions</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <>
                          <SkeletonRow cols={4} />
                          <SkeletonRow cols={4} />
                          <SkeletonRow cols={4} />
                        </>
                      ) : errorMsg ? (
                        <tr>
                          <td className="p-6 text-red-600" colSpan={4}>
                            {errorMsg}
                          </td>
                        </tr>
                      ) : filteredSorted.length === 0 ? (
                        <tr>
                          <td className="p-6 text-slate-600" colSpan={4}>
                            No quizzes found.
                          </td>
                        </tr>
                      ) : (
                        filteredSorted.map((q) => {
                          const title =
                            q?.name ||
                            q?.quiz_title ||
                            q?.title ||
                            `Quiz #${q?.id}`;
                          const st = statusOf(q, now);

                          return (
                            <tr
                              key={q.id}
                              className="border-t border-slate-100 hover:bg-slate-50/50 transition"
                            >
                              <Td className="font-medium">{title}</Td>
                              <Td>
                                {editingId === q.id ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <label className="text-xs text-slate-500 w-12">
                                        Start:
                                      </label>
                                      <input
                                        type="datetime-local"
                                        value={editingDates.start_time || ""}
                                        onChange={(e) =>
                                          handleDateChange(
                                            "start_time",
                                            e.target.value
                                          )
                                        }
                                        className="text-xs px-2 py-1 border rounded"
                                        aria-label="Start date time"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <label className="text-xs text-slate-500 w-12">
                                        End:
                                      </label>
                                      <input
                                        type="datetime-local"
                                        value={editingDates.end_time || ""}
                                        onChange={(e) =>
                                          handleDateChange(
                                            "end_time",
                                            e.target.value
                                          )
                                        }
                                        className="text-xs px-2 py-1 border rounded"
                                        aria-label="End date time"
                                      />
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                      <button
                                        onClick={() => saveDateChanges(q.id)}
                                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={cancelEditing}
                                        className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-0.5">
                                    <div className="text-slate-900">
                                      {fmt(q.start_time || q.start_at)}
                                    </div>
                                    <div className="text-slate-500 text-xs">
                                      to {fmt(q.end_time || q.end_at)}
                                    </div>
                                    <button
                                      onClick={() => startEditing(q)}
                                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                    >
                                      Edit dates
                                    </button>
                                  </div>
                                )}
                              </Td>
                              <Td>
                                <Badge
                                  tone={
                                    st === "ongoing"
                                      ? "green"
                                      : st === "upcoming"
                                      ? "blue"
                                      : st === "past"
                                      ? "gray"
                                      : "amber"
                                  }
                                >
                                  {st}
                                </Badge>
                              </Td>
                              <Td>
                                <div className="flex gap-2 justify-end items-center">
                                  <button
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 transition"
                                    onClick={() => handleDelete(q.id)}
                                    disabled={deletingId === q.id || editingId === q.id}
                                    title="Delete quiz"
                                  >
                                    <Icon.Trash className="h-4 w-4" />
                                    <span>
                                      {deletingId === q.id ? "Deleting…" : "Delete"}
                                    </span>
                                  </button>
                                </div>
                              </Td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Mobile Cards */}
              <section className="md:hidden space-y-3" aria-label="Quizzes">
                {loading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : errorMsg ? (
                  <div className="rounded-3xl border border-red-200 bg-white/80 backdrop-blur p-4 text-red-700">
                    {errorMsg}
                  </div>
                ) : filteredSorted.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-4 text-slate-700">
                    No quizzes found.
                  </div>
                ) : (
                  filteredSorted.map((q) => {
                    const title =
                      q?.name || q?.quiz_title || q?.title || `Quiz #${q?.id}`;
                    const st = statusOf(q, now);
                    return (
                      <div
                        key={q.id}
                        className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-4 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-base font-semibold text-slate-900">
                              {title}
                            </div>
                          </div>
                          <Badge
                            tone={
                              st === "ongoing"
                                ? "green"
                                : st === "upcoming"
                                ? "blue"
                                : st === "past"
                                ? "gray"
                                : "amber"
                            }
                          >
                            {st}
                          </Badge>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2">
                            <div className="text-xs text-slate-500">Start</div>
                            <div className="text-slate-900">
                              {fmt(q.start_time || q.start_at)}
                            </div>
                          </div>
                          <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2">
                            <div className="text-xs text-slate-500">End</div>
                            <div className="text-slate-900">
                              {fmt(q.end_time || q.end_at)}
                            </div>
                          </div>
                        </div>

                        {editingId === q.id && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-2xl space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-slate-600 w-12">
                                Start:
                              </label>
                              <input
                                type="datetime-local"
                                value={editingDates.start_time || ""}
                                onChange={(e) =>
                                  handleDateChange("start_time", e.target.value)
                                }
                                className="flex-1 text-xs px-2 py-1 border rounded"
                                aria-label="Start date time"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-slate-600 w-12">
                                End:
                              </label>
                              <input
                                type="datetime-local"
                                value={editingDates.end_time || ""}
                                onChange={(e) =>
                                  handleDateChange("end_time", e.target.value)
                                }
                                className="flex-1 text-xs px-2 py-1 border rounded"
                                aria-label="End date time"
                              />
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => saveDateChanges(q.id)}
                                className="flex-1 text-xs px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="flex-1 text-xs px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-end">
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 transition"
                            onClick={() => handleDelete(q.id)}
                            disabled={deletingId === q.id || editingId === q.id}
                            title="Delete quiz"
                          >
                            <Icon.Trash className="h-4 w-4" />
                            <span className="text-sm">
                              {deletingId === q.id ? "Deleting…" : "Delete"}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </section>

              <p className="text-xs text-slate-500 mt-6">
                Tip: Click "Edit dates" to modify quiz start and end times.
              </p>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

/* ========================= Presentational helpers ========================= */
function Th({ children, className = "" }) {
  return (
    <th className={`px-4 py-3 text-left text-slate-700 font-semibold ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 align-top text-slate-900 ${className}`}>{children}</td>;
}

function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-slate-100/80 text-slate-700 border-slate-200",
    blue: "bg-blue-100/80 text-blue-700 border-blue-200",
    green: "bg-emerald-100/80 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100/80 text-amber-800 border-amber-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${tones[tone] || tones.gray}`}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-5 shadow-sm hover:shadow-md transition">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-3xl font-extrabold tracking-tight">{value}</div>
    </div>
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
                active ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900"
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

/* ========================= Icons (inline SVG) ========================= */
const Icon = {
  Search: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
    </svg>
  ),
  Calendar: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Refresh: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M5 19a8 8 0 0 0 14-5 8 8 0 0 0-8-8" />
    </svg>
  ),
  SortAsc: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 18h7M4 12h11M4 6h15M15 9l3-3 3 3" />
    </svg>
  ),
  SortDesc: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 18h15M4 12h11M4 6h7M15 15l3 3 3-3" />
    </svg>
  ),
  Trash: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
    </svg>
  ),
};

/* ========================= Skeletons ========================= */
function SkeletonRow({ cols = 4 }) {
  return (
    <tr className="border-t border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full max-w-[180px] animate-pulse rounded bg-slate-200/70" />
        </td>
      ))}
    </tr>
  );
}
function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-4 shadow-sm">
      <div className="h-4 w-1/3 bg-slate-200/70 rounded animate-pulse" />
      <div className="mt-2 h-3 w-1/4 bg-slate-200/70 rounded animate-pulse" />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="h-12 bg-slate-200/70 rounded-2xl animate-pulse" />
        <div className="h-12 bg-slate-200/70 rounded-2xl animate-pulse" />
      </div>
      <div className="mt-3 h-8 bg-slate-200/70 rounded-2xl animate-pulse" />
    </div>
  );
}