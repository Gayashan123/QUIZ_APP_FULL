import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiSearch,
  FiUser,
  FiChevronRight,
  FiXCircle,
  FiBarChart2,
  FiAward,
  FiTrendingUp,
  FiBookOpen,
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

/* ---------------- UI ---------------- */
const GlassCard = ({ children, className = "", onClick, ...rest }) => (
  <div
    className={[
      "bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/30",
      "shadow-2xl shadow-blue-100/30",
      "p-6 transition-all duration-300",
      onClick ? "cursor-pointer hover:scale-[1.02]" : "",
      "hover:shadow-2xl hover:shadow-blue-200/50",
      className,
    ].join(" ")}
    onClick={onClick}
    {...rest}
  >
    {children}
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="h-20 bg-gradient-to-r from-blue-50/60 to-purple-50/60 rounded-2xl animate-pulse border border-white/30"
      />
    ))}
  </div>
);

/* ---------------- Normalizers ---------------- */
const normalizeStudent = (s) => {
  const name =
    s?.name ||
    [s?.first_name, s?.last_name].filter(Boolean).join(" ") ||
    s?.user?.name ||
    "Unknown Student";
  const email = s?.email || s?.user?.email || "";
  return {
    id: s?.id ?? s?.student_id ?? s?.user_id,
    name,
    email,
  };
};

/* ---------------- Helpers ---------------- */
const getInitials = (name = "") => {
  const parts = name
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return "ST";
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
};

const colorAt = (index) => {
  const colors = [
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-pink-500 to-pink-600",
    "from-green-500 to-green-600",
    "from-orange-500 to-orange-600",
    "from-teal-500 to-teal-600",
  ];
  return colors[index % colors.length];
};

/* ---------------- Component ---------------- */
export default function StudentAnalyzeList() {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [query, setQuery] = useState("");

  // Overview stats (replace with real aggregates if you have endpoints)
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await fetchJSON("students");
        const list = Array.isArray(data) ? data : data?.data || data?.students || [];
        const normalized = list.map(normalizeStudent).filter((s) => s.id);
        normalized.sort((a, b) => a.name.localeCompare(b.name));
        if (mounted) {
          setStudents(normalized);
          setStats({
            total: normalized.length,
            active: normalized.length, // placeholder
            completed: Math.max(0, Math.round(normalized.length * 0.75)), // placeholder
          });
        }
      } catch (e) {
        console.error(e);
        if (mounted) setErr("Failed to load students. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => `${s.name} ${s.email}`.toLowerCase().includes(q));
  }, [students, query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40 text-slate-900 flex">
      <Sidebar />

      <main className="flex-1 relative ml-0 lg:ml-64 transition-all duration-300">
        {/* Background blobs behind content */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-20 right-20 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <FiBarChart2 className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  Student Analytics
                </h1>
                <p className="text-slate-600 mt-1">
                  Track and analyze student performance with a clean, modern interface.
                </p>
              </div>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-2xl mx-auto mb-3">
                <FiUsers className="text-blue-600 text-xl" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
              <div className="text-sm text-slate-600">Total Students</div>
            </GlassCard>

            <GlassCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-2xl mx-auto mb-3">
                <FiTrendingUp className="text-green-600 text-xl" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{stats.active}</div>
              <div className="text-sm text-slate-600">Active Students</div>
            </GlassCard>

            <GlassCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-2xl mx-auto mb-3">
                <FiAward className="text-purple-600 text-xl" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{stats.completed}</div>
              <div className="text-sm text-slate-600">Completed Quizzes</div>
            </GlassCard>
          </div>

          {/* Directory + Search */}
          <GlassCard className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <FiUsers className="text-blue-600" />
                  Student Directory
                </h2>
                <p className="text-slate-600 text-sm">
                  Select a student to view their detailed analytics page.
                </p>
              </div>

              <div className="relative flex-1 sm:max-w-xs">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search students by name or email…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/60 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  aria-label="Search students"
                />
              </div>
            </div>

            {/* Error */}
            {err && (
              <div className="flex items-center gap-3 p-4 bg-red-50/80 border border-red-200 rounded-2xl mb-6">
                <FiXCircle className="text-red-500 flex-shrink-0" />
                <div className="text-red-700 text-sm">{err}</div>
              </div>
            )}

            {/* Loading / Empty / Grid */}
            {loading ? (
              <LoadingSkeleton />
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <FiBookOpen className="mx-auto text-3xl text-slate-400 mb-3" />
                <h3 className="text-lg font-medium text-slate-700 mb-2">No students found</h3>
                <p className="text-slate-500">
                  {query ? "Try adjusting your search terms" : "No students available in the system"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => navigate(`/teacher/students/${s.id}/analyze`)}
                    className="text-left group relative cursor-pointer transform transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-200 rounded-3xl"
                    aria-label={`View details for ${s.name}`}
                  >
                    <div className="relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-3xl border border-white/30 p-5 shadow-lg shadow-blue-100/20 hover:shadow-2xl hover:shadow-blue-200/30 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div
                          className={[
                            "flex-shrink-0 w-14 h-14 rounded-2xl",
                            "bg-gradient-to-r text-white font-semibold text-lg shadow-lg",
                            colorAt(idx),
                          ].join(" ")}
                          aria-hidden="true"
                        >
                          <div className="w-full h-full flex items-center justify-center">
                            {getInitials(s.name)}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                            {s.name}
                          </h3>
                          <p className="text-slate-600 text-sm truncate">
                            {s.email || "No email provided"}
                          </p>
                        </div>

                        <FiChevronRight className="flex-shrink-0 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>

                      {/* Hover ring */}
                      <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-200/50 transition-all duration-300" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Results Count */}
            {!loading && filtered.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200/50">
                <p className="text-sm text-slate-500">
                  Showing {filtered.length} of {students.length} students
                  {query && ` matching "${query}"`}
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </main>

      {/* Floating Search Button (focuses search input) */}
      <button
        type="button"
        onClick={() => {
          searchRef.current?.focus();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-600/40 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label="Focus student search"
      >
        <FiSearch className="text-xl" />
      </button>
    </div>
  );
}