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
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import api from "../../Admin/common/api";

/* ---------------- Utilities ---------------- */
const extractApiError = (e) =>
  e?.response?.data?.message ||
  e?.response?.data?.error ||
  (e?.response?.data?.errors
    ? Object.values(e.response.data.errors).flat().join(" ")
    : "") ||
  e?.message ||
  "Request failed";

const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "—");
const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

/* ---------------- Normalizers ---------------- */
const normalizeStudent = (s) => ({
  id: s?.id,
  name:
    s?.name ||
    [s?.first_name, s?.last_name].filter(Boolean).join(" ") ||
    "Student",
  email: s?.email || "",
});

const normalizeAttempt = (row) => ({
  id: row?.id,
  quizId: row?.quiz_id,
  score: toNumber(row?.score),
  finished: !!row?.finished,
  finishedAt: row?.finished_at || null,
  quizTitle: row?.quiz?.quiz_title || row?.quiz?.title || row?.quiz?.name || "",
  subject: row?.quiz?.subject?.name || "",
});

/* ---------------- UI helpers ---------------- */
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white/80 backdrop-blur rounded-2xl border border-slate-200 shadow-sm p-5 ${className}`}
  >
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
        <div className="text-xs uppercase tracking-wide text-slate-500">
          {label}
        </div>
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
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-sm font-medium ${tone}`}
    >
      {score}%
    </span>
  );
};

const getInitials = (name = "") => {
  const parts = name.split(" ").filter(Boolean);
  if (!parts.length) return "ST";
  return parts
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
};

/* ---------------- Review Modal ---------------- */
function ReviewModal({ open, onClose, loading, error, data, studentName }) {
  if (!open) return null;

  const summary = data?.summary;
  const questions = data?.questions || [];
  const score = data?.attempt?.score ?? summary?.percent ?? null;
  const finishedAt = data?.attempt?.finished_at;
  const quizTitle = data?.attempt?.quiz?.title || "Quiz";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
      <div className="w-full sm:max-w-3xl max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">
              {studentName} • {quizTitle}
            </h3>
            <p className="text-sm text-slate-500">Detailed attempt review</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 inline-grid place-items-center rounded-full hover:bg-slate-100"
          >
            <FiX />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-32 bg-slate-200 rounded" />
            </div>
          ) : error ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700">
              {error}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                <ScoreBadge score={score} />
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700">
                  <FiCheck /> Correct: {summary?.correct ?? 0}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-rose-100 text-rose-700">
                  <FiX /> Wrong:{" "}
                  {(summary?.total ?? 0) - (summary?.correct ?? 0)}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                  Total: {summary?.total ?? 0}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700">
                  <FiClock /> {fmtDate(finishedAt)}
                </span>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const sel = q.selected_option_id;
                  return (
                    <div
                      key={q.id}
                      className="rounded-xl border p-3 space-y-2"
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">
                          {idx + 1}. {q.question_text}
                        </div>
                        <div
                          className={`text-sm ${
                            q.is_correct
                              ? "text-emerald-700"
                              : "text-rose-700"
                          }`}
                        >
                          {q.is_correct ? "Correct" : "Wrong"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {q.options.map((o) => {
                          const isSel = sel === o.id;
                          const isRight = !!o.is_correct;
                          const cls = isRight
                            ? "bg-emerald-50 border-emerald-200"
                            : isSel
                            ? "bg-rose-50 border-rose-200"
                            : "bg-white";
                          return (
                            <div
                              key={o.id}
                              className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${cls}`}
                            >
                              <span className="text-sm">{o.option_text}</span>
                              {isRight && (
                                <span className="ml-auto text-xs">Correct</span>
                              )}
                              {isSel && !isRight && (
                                <span className="ml-auto text-xs">
                                  Your choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="p-3 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Main Page ---------------- */
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

  // Load student + attempts
  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const sRes = await api.get(`students/${studentId}`);
      const sData = sRes?.data?.data || sRes?.data;
      setStudent(normalizeStudent(sData));

      const aRes = await api.get(`students/${studentId}/quizzes`);
      const raw = Array.isArray(aRes.data)
        ? aRes.data
        : aRes.data?.data || aRes.data?.attempts || [];
      const normalized = (raw || []).map(normalizeAttempt);

      setAttempts(normalized);
    } catch (e) {
      setErr(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) load();
  }, [studentId, load]);

  const avgScore = useMemo(() => {
    const vals = attempts.map((a) => a.score).filter((n) => n != null);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((x, y) => x + y, 0) / vals.length);
  }, [attempts]);

  const completedCount = useMemo(
    () => attempts.filter((a) => a.finished).length,
    [attempts]
  );

  const lastActivity = useMemo(() => {
    const t =
      attempts
        .map((a) =>
          a.finishedAt ? new Date(a.finishedAt).getTime() : 0
        )
        .sort((a, b) => b - a)[0] || 0;
    return t ? fmtDate(t) : "—";
  }, [attempts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return attempts;
    return attempts.filter((a) =>
      `${a.quizTitle} ${a.subject}`.toLowerCase().includes(q)
    );
  }, [attempts, query]);

  const openReview = useCallback(
    async (quizId) => {
      setModalOpen(true);
      setReviewLoading(true);
      setReviewError("");
      setReviewData(null);
      try {
        const res = await api.get(
          `students/${studentId}/quizzes/${quizId}/review`
        );
        setReviewData(res.data);
      } catch (e) {
        setReviewError(extractApiError(e));
      } finally {
        setReviewLoading(false);
      }
    },
    [studentId]
  );

  const closeReview = useCallback(() => {
    setModalOpen(false);
    setReviewData(null);
    setReviewError("");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      <Sidebar />

      <main className="flex-1 relative ml-0 lg:ml-64 p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white grid place-items-center text-lg font-semibold">
            {getInitials(student?.name || "ST")}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              {student?.name || "Student"}
            </h1>
            <div className="flex items-center gap-3 text-slate-600">
              <span className="inline-flex items-center gap-1">
                <FiMail /> {student?.email || "—"}
              </span>
            </div>
          </div>
        </div>

        {err && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 mb-4">
            {err}
          </div>
        )}

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
            sub="Finished attempts"
          />
          <StatTile
            icon={FiClock}
            label="Last Activity"
            value={lastActivity}
          />
        </div>

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
          </div>
        </Card>

        <Card>
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Quiz Attempts</h2>
            {loading && <span className="text-sm text-slate-500">Loading…</span>}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-slate-600">No attempts found.</div>
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
                          <span className="font-medium">
                            {a.quizTitle || `Quiz #${a.quizId}`}
                          </span>
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

      <ReviewModal
        open={modalOpen}
        onClose={closeReview}
        loading={reviewLoading}
        error={reviewError}
        data={reviewData}
        studentName={student?.name || "Student"}
      />
    </div>
  );
}
