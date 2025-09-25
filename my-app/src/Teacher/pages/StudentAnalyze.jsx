import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiMail,
  FiAward,
  FiTrendingUp,
  FiClock,
  FiCalendar,
  FiBook,
  FiDownload,
  FiX,
  FiCheck,
  FiSearch,
  FiAlertCircle,
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import api from "../../Admin/common/api";

/* ---------------- Enhanced Utilities ---------------- */
const extractApiError = (e) => {
  console.error("API Error Details:", e);
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    (e?.response?.data?.errors
      ? Object.values(e.response.data.errors).flat().join(" ")
      : "") ||
    e?.message ||
    "Request failed"
  );
};

const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "—");
const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

/* ---------------- Enhanced Normalizers ---------------- */
const normalizeStudent = (s) => {
  console.log("📊 Normalizing student data:", s);
  const studentData = {
    id: s?.id || s?.student_id,
    name: s?.name || s?.student_name || [s?.first_name, s?.last_name].filter(Boolean).join(" ") || "Student",
    email: s?.email || s?.student_email || "",
  };
  console.log("✅ Normalized student:", studentData);
  return studentData;
};

const normalizeAttempt = (row) => {
  console.log("📊 Normalizing attempt data:", row);
  const attemptData = {
    id: row?.id || row?.attempt_id,
    quizId: row?.quiz_id || row?.quiz?.id,
    score: toNumber(row?.score),
    finished: !!row?.finished,
    finishedAt: row?.finished_at || row?.completed_at || row?.submitted_at,
    quizTitle: row?.quiz?.quiz_title || row?.quiz?.title || row?.quiz_title || "Untitled Quiz",
    subject: row?.quiz?.subject?.name || row?.subject || row?.quiz?.subject_name || "",
  };
  console.log("✅ Normalized attempt:", attemptData);
  return attemptData;
};

/* ---------------- UI Components (unchanged) ---------------- */
const Card = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur rounded-2xl border border-slate-200 shadow-sm p-5 ${className}`}>
    {children}
  </div>
);

const StatTile = ({ icon: Icon, label, value, sub }) => (
  <div className="rounded-2xl bg-white/80 backdrop-blur border border-black/5 p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white flex items-center justify-center">
        <Icon />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-2xl font-bold leading-tight">{value}</div>
        {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
      </div>
    </div>
  </div>
);

const ScoreBadge = ({ score }) => {
  if (score == null) return <span className="text-slate-500">—</span>;
  let tone = "bg-rose-100 text-rose-700";
  if (score >= 80) tone = "bg-emerald-100 text-emerald-700";
  else if (score >= 60) tone = "bg-amber-100 text-amber-700";
  return <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${tone}`}>{score}%</span>;
};

const getInitials = (name = "") => {
  const parts = name.split(" ").filter(Boolean);
  if (!parts.length) return "ST";
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("");
};

/* ---------------- Enhanced Main Component ---------------- */
export default function StudentAnalyzeDetails() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewData, setReviewData] = useState(null);

  // Enhanced load function with debugging
  const load = useCallback(async () => {
    if (!studentId) {
      setErr("No student ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr("");
    
    try {
      console.log("🚀 Starting data fetch for student:", studentId);
      
      // Fetch student data
      console.log("📞 Calling API: students/${studentId}");
      const sRes = await api.get(`students/${studentId}`);
      console.log("✅ Student API response:", sRes.data);
      
      const sData = sRes?.data?.data || sRes?.data || sRes;
      console.log("📋 Processed student data:", sData);
      
      if (!sData) {
        throw new Error("No student data received from API");
      }
      
      setStudent(normalizeStudent(sData));

      // Fetch attempts data
      console.log("📞 Calling API: students/${studentId}/quizzes");
      const aRes = await api.get(`students/${studentId}/quizzes`);
      console.log("✅ Attempts API response:", aRes.data);
      
      let raw = [];
      if (Array.isArray(aRes.data)) {
        raw = aRes.data;
      } else if (aRes.data?.data) {
        raw = aRes.data.data;
      } else if (aRes.data?.attempts) {
        raw = aRes.data.attempts;
      } else if (aRes.data) {
        raw = [aRes.data]; // Wrap single object in array
      }
      
      console.log("📋 Raw attempts data:", raw);
      
      const normalized = raw.map(normalizeAttempt);
      console.log("✅ Normalized attempts:", normalized);
      
      setAttempts(normalized);
      
    } catch (e) {
      console.error("❌ Error loading data:", e);
      const errorMsg = extractApiError(e);
      setErr(errorMsg);
    } finally {
      setLoading(false);
      console.log("🏁 Data loading completed");
    }
  }, [studentId]);

  useEffect(() => {
    console.log("🎯 Component mounted with studentId:", studentId);
    load();
  }, [studentId, load]);

  // Add retry function
  const retryLoad = () => {
    console.log("🔄 Retrying data load...");
    load();
  };

  // Derived data
  const avgScore = useMemo(() => {
    const vals = attempts.map((a) => a.score).filter((n) => n != null);
    return vals.length ? Math.round(vals.reduce((x, y) => x + y, 0) / vals.length) : 0;
  }, [attempts]);

  const completedCount = useMemo(() => attempts.filter((a) => a.finished).length, [attempts]);
  const lastActivity = useMemo(() => {
    const times = attempts.map((a) => (a.finishedAt ? new Date(a.finishedAt).getTime() : 0));
    const latest = Math.max(...times);
    return latest ? fmtDate(latest) : "—";
  }, [attempts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? attempts.filter((a) => `${a.quizTitle} ${a.subject}`.toLowerCase().includes(q)) : attempts;
  }, [attempts, query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
        <Sidebar />
        <main className="flex-1 relative ml-0 lg:ml-64 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <div className="text-lg font-medium">Loading student data...</div>
              <div className="text-sm text-slate-500">Student ID: {studentId}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      <Sidebar />

      <main className="flex-1 relative ml-0 lg:ml-64 p-6">
        {/* Error Display */}
        {err && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="text-rose-600 text-xl" />
              <div>
                <div className="font-semibold text-rose-800">Failed to load data</div>
                <div className="text-rose-700 text-sm mt-1">{err}</div>
                <button 
                  onClick={retryLoad}
                  className="mt-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white grid place-items-center text-lg font-semibold">
            {getInitials(student?.name || "ST")}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              {student?.name || "Student Not Found"}
            </h1>
            <div className="flex items-center gap-3 text-slate-600">
              <span className="inline-flex items-center gap-1">
                <FiMail /> {student?.email || "No email"}
              </span>
              <span>ID: {studentId}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatTile
            icon={FiAward}
            label="Average Score"
            value={`${avgScore}%`}
            sub="Across all attempts"
          />
          <StatTile
            icon={FiTrendingUp}
            label="Completed Quizzes"
            value={completedCount}
            sub={`of ${attempts.length} total`}
          />
          <StatTile
            icon={FiClock}
            label="Last Activity"
            value={lastActivity}
          />
        </div>

        {/* Search */}
        <Card className="mb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search attempts by quiz title or subject…"
                className="w-full rounded-xl pl-9 pr-3 py-2 border shadow-sm focus:ring-2 focus:ring-slate-300"
              />
            </div>
            <div className="text-sm text-slate-500">
              {filtered.length} of {attempts.length} attempts
            </div>
          </div>
        </Card>

        {/* Attempts Table */}
        <Card>
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Quiz Attempts</h2>
            <div className="text-sm text-slate-500">
              {attempts.length} total attempts
            </div>
          </div>

          {attempts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FiBook className="mx-auto text-3xl mb-2 text-slate-300" />
              <div>No quiz attempts found for this student.</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FiSearch className="mx-auto text-3xl mb-2 text-slate-300" />
              <div>No attempts match your search.</div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3">Quiz</th>
                    <th className="text-left px-4 py-3">Subject</th>
                    <th className="text-left px-4 py-3">Finished</th>
                    <th className="text-left px-4 py-3">Score</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2">
                          <span className="h-6 w-6 rounded-lg bg-indigo-600 text-white grid place-items-center">
                            <FiBook />
                          </span>
                          <span className="font-medium">{a.quizTitle}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{a.subject || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1">
                          <FiCalendar /> {fmtDate(a.finishedAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={a.score} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openReview(a.quizId)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-indigo-700 hover:bg-indigo-50 transition"
                          disabled={!a.finished}
                        >
                          <FiDownload /> View details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}