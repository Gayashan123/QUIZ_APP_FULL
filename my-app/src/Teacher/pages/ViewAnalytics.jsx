import React, { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../../Admin/common/api";
import {
  FiUsers,
  FiChevronDown,
  FiChevronUp,
  FiBook,
  FiCalendar,
  FiClock,
  FiDownload,
  FiX,
  FiCheck,
} from "react-icons/fi";

/* ---------------- Helpers ---------------- */
const getInitials = (name = "") => {
  const parts = name.split(" ").filter(Boolean);
  if (!parts.length) return "ST";
  return parts
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
};

const colorAt = (index) => {
  const colors = [
    "bg-gradient-to-r from-blue-500 to-blue-600",
    "bg-gradient-to-r from-purple-500 to-purple-600",
    "bg-gradient-to-r from-pink-500 to-pink-600",
    "bg-gradient-to-r from-green-500 to-green-600",
    "bg-gradient-to-r from-orange-500 to-orange-600",
    "bg-gradient-to-r from-teal-500 to-teal-600",
  ];
  return colors[index % colors.length];
};

const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "—");
const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

const normalizeQuiz = (q) => ({
  id: q.id ?? q.quiz_id ?? q.uuid,
  title: q.quiz_title || q.title || q.name || "Untitled Quiz",
  subject: q.subject?.name || q.subject_name || "—",
  createdAt: q.created_at || q.createdAt || q.start_time || q.start_at || null,
});

const normalizeAttempt = (r) => ({
  attemptId: r.id,
  studentId: r.student?.id ?? r.student_id ?? r.user_id ?? r.id,
  name: r.student?.name || r.name || r.student_name || "Unknown Student",
  email: r.student?.email || r.email || "",
  score: toNumber(r.score),
  finishedAt: r.finished_at || r.completed_at || null,
});

/* ---------------- UI atoms ---------------- */
const Card = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur rounded-2xl border border-slate-200 shadow-sm p-5 ${className}`}>
    {children}
  </div>
);

const ScoreBadge = ({ score }) => {
  if (score == null) return <span className="text-slate-500">—</span>;
  let tone = "bg-red-100 text-red-700";
  if (score >= 80) tone = "bg-emerald-100 text-emerald-700";
  else if (score >= 60) tone = "bg-amber-100 text-amber-700";
  return <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${tone}`}>{score}%</span>;
};

const StatPill = ({ label, value, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-rose-100 text-rose-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${tones[tone] || tones.slate}`}>
      <span className="font-medium">{label}:</span> {value}
    </span>
  );
};

const Divider = () => <div className="h-px bg-slate-200 my-4" />;

/* ---------------- Modal ---------------- */
function ReviewModal({ open, onClose, loading, error, data, studentName }) {
  if (!open) return null;

  const summary = data?.summary;
  const questions = data?.questions || [];
  const score = data?.attempt?.score ?? summary?.percent ?? null;
  const finishedAt = data?.attempt?.finished_at;
  const quizTitle = data?.attempt?.quiz?.title || "Quiz";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-title"
    >
      <div className="w-full sm:max-w-3xl max-h-[90vh] overflow-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h3 id="review-title" className="text-lg font-semibold">
              {studentName} • {quizTitle}
            </h3>
            <p className="text-sm text-slate-500">Detailed attempt review</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-slate-100"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              <div className="h-5 bg-slate-200 rounded animate-pulse w-2/3" />
              <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
              <div className="h-32 bg-slate-200 rounded animate-pulse" />
            </div>
          ) : error ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700">{error}</div>
          ) : (
            <>
              {/* Summary */}
              <div className="flex flex-wrap items-center gap-2">
                <ScoreBadge score={score} />
                <StatPill label="Correct" value={summary?.correct ?? 0} tone="green" />
                <StatPill
                  label="Wrong"
                  value={(summary?.total ?? 0) - (summary?.correct ?? 0)}
                  tone="red"
                />
                <StatPill label="Total" value={summary?.total ?? 0} tone="blue" />
                <StatPill label="Finished" value={fmtDate(finishedAt)} />
              </div>

              <Divider />

              {/* Questions */}
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const sel = q.selected_option_id;
                  return (
                    <div key={q.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-medium">
                          {idx + 1}. {q.question_text}
                        </div>
                        <div className={`inline-flex items-center gap-1 text-sm ${q.is_correct ? "text-emerald-700" : "text-rose-700"}`}>
                          {q.is_correct ? <FiCheck /> : <FiX />} {q.is_correct ? "Correct" : "Wrong"}
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        {q.options.map((o) => {
                          const isSel = sel === o.id;
                          const isRight = !!o.is_correct;
                          const cls = isRight
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : isSel
                            ? "bg-rose-50 border-rose-200 text-rose-800"
                            : "bg-white";
                          return (
                            <div
                              key={o.id}
                              className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${cls}`}
                            >
                              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {isRight ? "A" : "O"}
                              </span>
                              <span className="text-sm">{o.option_text}</span>
                              {isRight && <span className="ml-auto text-xs">Correct</span>}
                              {isSel && !isRight && <span className="ml-auto text-xs">Your choice</span>}
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

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 flex items-center justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-black">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Main Page ---------------- */
export default function QuizStudentsPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [errorQuizzes, setErrorQuizzes] = useState("");

  // Expanded quiz state
  const [expanded, setExpanded] = useState(null);

  // Students per quiz
  const [studentsByQuiz, setStudentsByQuiz] = useState({});
  const [loadingStudents, setLoadingStudents] = useState({});
  const [errorStudents, setErrorStudents] = useState({});

  // Review modal
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewData, setReviewData] = useState(null);
  const [reviewStudentName, setReviewStudentName] = useState("");

  // Load quizzes
  const loadQuizzes = useCallback(async () => {
    setLoadingQuizzes(true);
    setErrorQuizzes("");
    try {
      const { data } = await api.get("quizzes"); // no leading slash
      const list = Array.isArray(data) ? data : data?.data || [];
      setQuizzes(list.map(normalizeQuiz));
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Failed to load quizzes";
      setErrorQuizzes(msg);
    } finally {
      setLoadingQuizzes(false);
    }
  }, []);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  // Load students for a quiz
  const loadStudents = useCallback(async (quizId) => {
    setLoadingStudents((s) => ({ ...s, [quizId]: true }));
    setErrorStudents((s) => ({ ...s, [quizId]: "" }));
    try {
      const { data } = await api.get(`quizzes/${quizId}/students`); // no leading slash
      const items = Array.isArray(data) ? data : data?.data || data?.students || [];
      setStudentsByQuiz((prev) => ({ ...prev, [quizId]: items.map(normalizeAttempt) }));
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Failed to load students";
      setErrorStudents((s) => ({ ...s, [quizId]: msg }));
      setStudentsByQuiz((prev) => ({ ...prev, [quizId]: [] }));
    } finally {
      setLoadingStudents((s) => ({ ...s, [quizId]: false }));
    }
  }, []);

  const toggleQuiz = useCallback(
    async (quizId) => {
      setExpanded((prev) => (prev === quizId ? null : quizId));
      if (!studentsByQuiz[quizId] && !loadingStudents[quizId]) {
        await loadStudents(quizId);
      }
    },
    [studentsByQuiz, loadingStudents, loadStudents]
  );

  // Open review
  const openReview = useCallback(async (student, quizId) => {
    setReviewStudentName(student.name || "Student");
    setModalOpen(true);
    setReviewLoading(true);
    setReviewError("");
    setReviewData(null);
    try {
      const { data } = await api.get(
        `students/${student.studentId}/quizzes/${quizId}/review` // no leading slash
      );
      setReviewData(data);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Failed to load review";
      setReviewError(msg);
    } finally {
      setReviewLoading(false);
    }
  }, []);

  const closeReview = useCallback(() => {
    setModalOpen(false);
    setReviewData(null);
    setReviewError("");
    setReviewStudentName("");
  }, []);

  // Derived
  const totalParticipants = useMemo(
    () => Object.values(studentsByQuiz).reduce((acc, arr) => acc + (arr?.length || 0), 0),
    [studentsByQuiz]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40 text-slate-900 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="flex-1 relative ml-0 lg:ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <FiUsers className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Quizzes & Students
              </h1>
              <p className="text-slate-600 mt-1">
                View your quizzes, participants, and per-question results.
              </p>
            </div>
          </div>
        </div>

        {/* Errors */}
        {errorQuizzes && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
            {errorQuizzes}
          </div>
        )}

        {/* Quizzes List */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <div className="text-sm text-slate-600">Total Quizzes</div>
              <div className="text-2xl font-bold">{quizzes.length}</div>
            </Card>
           
          
          </div>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Quizzes</h2>
              {loadingQuizzes && <span className="text-sm text-slate-500">Loading…</span>}
            </div>

            {loadingQuizzes ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-slate-600">No quizzes found.</div>
            ) : (
              <div className="space-y-3">
                {quizzes.map((q) => {
                  const isOpen = expanded === q.id;
                  const students = studentsByQuiz[q.id] || [];
                  const isLoading = !!loadingStudents[q.id];

                  return (
                    <div key={q.id} className="rounded-2xl border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => toggleQuiz(q.id)}
                        className="w-full flex items-center justify-between gap-4 p-4 hover:bg-slate-50 text-left"
                        aria-expanded={isOpen}
                        aria-controls={`panel-${q.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white grid place-items-center">
                            <FiBook />
                          </div>
                          <div>
                            <div className="font-semibold">{q.title}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                              <span>{q.subject}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="inline-flex items-center gap-1">
                                <FiCalendar /> {new Date(q.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="hidden sm:flex items-center gap-1">
                            <FiUsers /> <span>{students.length || 0}</span>
                          </div>
                          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                      </button>

                      {/* Panel */}
                      {isOpen && (
                        <div id={`panel-${q.id}`} className="p-4 pt-0">
                          {/* Students errors */}
                          {errorStudents[q.id] && (
                            <div className="p-3 mt-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
                              {errorStudents[q.id]}
                            </div>
                          )}

                          {/* Loading */}
                          {isLoading ? (
                            <div className="mt-4 h-10 rounded-xl bg-slate-100 animate-pulse" />
                          ) : students.length === 0 ? (
                            <div className="mt-4 text-slate-600">No participants yet.</div>
                          ) : (
                            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                              <table className="min-w-full text-sm">
                                <thead className="bg-slate-50">
                                  <tr>
                                    <th className="text-left px-4 py-3">Student</th>
                                    <th className="text-left px-4 py-3">Email</th>
                                    <th className="text-left px-4 py-3">Score</th>
                                    <th className="text-left px-4 py-3">Finished</th>
                                    <th className="text-right px-4 py-3">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  {students.map((s, idx) => (
                                    <tr key={`${s.attemptId}-${s.studentId}`}>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                          <div
                                            className={`h-10 w-10 rounded-xl text-white font-semibold grid place-items-center ${colorAt(
                                              idx
                                            )}`}
                                          >
                                            {getInitials(s.name)}
                                          </div>
                                          <span className="font-medium">{s.name}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">{s.email || "—"}</td>
                                      <td className="px-4 py-3">
                                        <ScoreBadge score={s.score} />
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="inline-flex items-center gap-1 text-slate-700">
                                          <FiClock /> {fmtDate(s.finishedAt)}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        <button
                                          onClick={() => openReview(s, q.id)}
                                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition"
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
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Review Modal */}
      <ReviewModal
        open={modalOpen}
        onClose={closeReview}
        loading={reviewLoading}
        error={reviewError}
        data={reviewData}
        studentName={reviewStudentName}
      />
    </div>
  );
}