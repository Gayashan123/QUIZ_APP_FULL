import React, {
  useEffect,
  useState,
  useMemo,
  useContext,
  useRef,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../Admin/common/api";
import { AuthContext } from "../../context/Auth";
import {
  ClockIcon,
  FlagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// Lazy Sidebar
const Sidebar = lazy(() => import("../component/Sidebar"));

/* ---------------- Helpers ---------------- */
const extractApiError = (e) =>
  e?.response?.data?.message ||
  e?.response?.data?.error ||
  (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(" ") : "") ||
  e?.message ||
  "Request failed";

const getAttemptToken = (quizId) => {
  try {
    return sessionStorage.getItem(`attemptToken:${quizId}`) || "";
  } catch {
    return "";
  }
};
const getAttemptEndAt = (quizId) => {
  try {
    return Number(sessionStorage.getItem(`attemptEndAt:${quizId}`) || 0);
  } catch {
    return 0;
  }
};
const getAttemptHeaders = (quizId) => {
  const t = getAttemptToken(quizId);
  return t ? { "X-Quiz-Token": t } : {};
};
const parseDate = (v) => (v ? new Date(v) : null);
const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

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
        <div className="min-h-screen bg-gradient-to-b from-fuchsia-50 via-white to-indigo-50 flex">
          <div className="flex-1 p-6 max-w-6xl mx-auto">
            <div className="rounded-2xl border border-red-200 bg-white p-4 text-red-700">
              Something went wrong. Please refresh and try again.
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------------- Main ---------------- */
export default function QuizAttemptPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [quiz, setQuiz] = useState(null);
  const [qList, setQList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [endAt, setEndAt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [studentId, setStudentId] = useState(null);

  // Refs
  const isMountedRef = useRef(true);
  const didAutoSubmitRef = useRef(false);
  const didManualSubmitRef = useRef(false);
  const halfAlertShown = useRef(false);
  const quarterAlertShown = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Ensure attempt token exists
  useEffect(() => {
    const token = getAttemptToken(quizId);
    if (!token) {
      toast.info("Please enter the quiz password first.");
      navigate(`/quiz/${quizId}/login`);
    }
  }, [quizId, navigate]);

  // Student ID
  useEffect(() => {
    if (user?.id) setStudentId(Number(user.id));
    else {
      try {
        const stored = JSON.parse(localStorage.getItem("userInfo"));
        if (stored?.id) setStudentId(Number(stored.id));
        else if (stored?.user?.id) setStudentId(Number(stored.user.id));
      } catch {}
    }
  }, [user?.id]);

  // Deadline from session
  useEffect(() => {
    const endMs = getAttemptEndAt(quizId);
    if (endMs > 0) {
      setEndAt(endMs);
      const now = Date.now();
      setTimeLeft(Math.max(0, Math.floor((endMs - now) / 1000)));
    }
  }, [quizId]);

  /* -------- Load quiz + questions + options (axios) -------- */
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Quiz meta
      const quizRes = await api.get(`quizzes/${quizId}`, {
        headers: getAttemptHeaders(quizId),
      });
      const meta = quizRes?.data?.data || quizRes?.data || {};
      setQuiz(meta);

      // Questions
      const qRes = await api.get(`quizzes/${quizId}/questions`, {
        headers: getAttemptHeaders(quizId),
      });
      const questions = Array.isArray(qRes?.data?.data)
        ? qRes.data.data
        : Array.isArray(qRes?.data)
        ? qRes.data
        : [];

      // Options per question
      const optionPromises = questions.map((q) =>
        api
          .get(`questions/${q.id}/options`, {
            headers: getAttemptHeaders(quizId),
          })
          .catch(() => ({ data: [] }))
      );
      const optionsArr = await Promise.all(optionPromises);

      const normalized = questions.map((q, idx) => {
        const raw = optionsArr[idx]?.data;
        const options = Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw)
          ? raw
          : [];
        return {
          id: q.id,
          question_text: q.question_text || q.text || "",
          options: options.map((o) => ({
            id: o.id,
            option_text: o.option_text || o.text || "",
          })),
          selectedOptionId: null,
          flagged: false,
        };
      });

      // Restore local draft
      const ATTEMPT_KEY = `qa:${studentId || "anon"}:${quizId}`;
      try {
        const raw = localStorage.getItem(ATTEMPT_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          const selMap = saved?.selected || {};
          const flagMap = saved?.flagged || {};
          const restored = normalized.map((q) => ({
            ...q,
            selectedOptionId: selMap[q.id] ?? null,
            flagged: !!flagMap[q.id],
          }));
          setQList(restored);
        } else {
          setQList(normalized);
        }
      } catch {
        setQList(normalized);
      }
    } catch (e) {
      const msg = extractApiError(e) || "Failed to load quiz";
      setError(msg);
      toast.error("Failed to load quiz: " + msg);
    } finally {
      setLoading(false);
    }
  }, [quizId, studentId]);

  useEffect(() => {
    load();
  }, [load]);

  /* -------- Half-time and quarter-time alerts -------- */
  const totalSec = useMemo(() => {
    const limitMin = Number(quiz?.time_limit || 0);
    return limitMin > 0 ? limitMin * 60 : null;
  }, [quiz?.time_limit]);

  useEffect(() => {
    if (!totalSec || !endAt) return;
    const half = Math.floor(totalSec / 2);
    const quarter = Math.floor(totalSec / 4);

    if (!halfAlertShown.current && timeLeft <= half) {
      halfAlertShown.current = true;
      toast.info("You're halfway through the time. Keep going!", { icon: "⏱️" });
    }
    if (!quarterAlertShown.current && timeLeft <= quarter) {
      quarterAlertShown.current = true;
      toast.warn("25% time remaining. Prioritize flagged questions.", { icon: "⚠️" });
    }
  }, [timeLeft, endAt, totalSec]);

  /* -------- Timer tick -------- */
  useEffect(() => {
    if (!endAt) return;
    const t = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, Math.floor((endAt - now) / 1000));
      if (!isMountedRef.current) {
        clearInterval(t);
        return;
      }
      setTimeLeft(left);
      if (left === 0 && !didAutoSubmitRef.current) {
        didAutoSubmitRef.current = true;
        handleSubmit(true).catch(() => {});
      }
    }, 1000);
    return () => clearInterval(t);
  }, [endAt, handleSubmit]);

  const mmss = useMemo(() => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  const answeredCount = useMemo(
    () => qList.filter((q) => q.selectedOptionId != null).length,
    [qList]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const currentIndex = useMemo(
    () => qList.findIndex((q) => q.selectedOptionId == null),
    [qList]
  );

  useEffect(() => {
    if (qList.length && activeIndex === 0 && currentIndex > 0) {
      setActiveIndex(currentIndex);
    }
  }, [qList, activeIndex, currentIndex]);

  const currentQuestion = qList[activeIndex];

  /* -------- Persist draft -------- */
  const persistDraft = useCallback(
    (nextList) => {
      try {
        const selected = {};
        const flagged = {};
        for (const q of nextList) {
          if (q.selectedOptionId != null) selected[q.id] = q.selectedOptionId;
          if (q.flagged) flagged[q.id] = true;
        }
        const ATTEMPT_KEY = `qa:${studentId || "anon"}:${quizId}`;
        localStorage.setItem(ATTEMPT_KEY, JSON.stringify({ selected, flagged }));
      } catch {}
    },
    [quizId, studentId]
  );

  const onSelect = (qid, oid) => {
    setQList((prev) => {
      const next = prev.map((q) => (q.id === qid ? { ...q, selectedOptionId: oid } : q));
      persistDraft(next);
      return next;
    });
  };

  const toggleFlag = () => {
    const qid = currentQuestion?.id;
    if (!qid) return;
    setQList((prev) => {
      const next = prev.map((q) => (q.id === qid ? { ...q, flagged: !q.flagged } : q));
      persistDraft(next);
      return next;
    });
  };

  /* -------- Warn before unload if draft -------- */
  useEffect(() => {
    const hasDraft = answeredCount > 0 && !didManualSubmitRef.current;
    const handler = (e) => {
      if (hasDraft) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [answeredCount]);

  /* -------- Submit -------- */
  const handleSubmit = useCallback(
    async (auto = false) => {
      if (!studentId) {
        toast.error("Student information not found. Please log in again.");
        return;
      }
      if (submitting) return;

      setSubmitting(true);
      try {
        const answers = qList
          .filter((q) => q.selectedOptionId != null)
          .map((q) => ({ question_id: q.id, option_id: q.selectedOptionId }));

        if (answers.length === 0 && !auto) {
          toast.info("Please answer at least one question before submitting.");
          setSubmitting(false);
          return;
        }

        const payload = { quiz_id: Number(quizId), answers };

        const res = await api.post(`student-quizzes/submit`, payload, {
          headers: getAttemptHeaders(quizId),
        });

        const scorePercent =
          res?.data?.meta?.score_percent ?? res?.data?.data?.score ?? 0;

        try {
          localStorage.removeItem(`qa:${studentId || "anon"}:${quizId}`);
          sessionStorage.removeItem(`attemptToken:${quizId}`);
          sessionStorage.removeItem(`attemptEndAt:${quizId}`);
        } catch {}

        didManualSubmitRef.current = true;
        toast.success(`Quiz submitted! Your score: ${scorePercent}%`);
        navigate("/studentquiz1");
      } catch (e) {
        const msg = extractApiError(e) || "Submission failed";
        if (!auto) {
          toast.error(msg);
        } else {
          sessionStorage.removeItem(`attemptToken:${quizId}`);
          sessionStorage.removeItem(`attemptEndAt:${quizId}`);
          toast.info("Time is up. Your attempt has ended.");
          navigate("/studentquiz1");
        }
      } finally {
        if (isMountedRef.current) setSubmitting(false);
      }
    },
    [qList, quizId, studentId, submitting, navigate]
  );

  /* -------- Derived UI metrics -------- */
  const totalQuestions = qList.length;
  const answeredPct = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const flaggedCount = qList.filter((q) => q.flagged).length;

  const timerPct = useMemo(() => {
    if (!totalSec || !endAt) return 0;
    const used = totalSec - timeLeft;
    return Math.min(100, Math.max(0, Math.round((used / totalSec) * 100)));
  }, [timeLeft, endAt, totalSec]);

  /* -------- Render -------- */
  if (loading) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-b from-fuchsia-50 via-white to-indigo-50 flex">
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
          <div className="flex-1 p-6 max-w-6xl mx-auto">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-200/70 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (error || !quiz || qList.length === 0) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-b from-fuchsia-50 via-white to-indigo-50 flex">
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
          <div className="flex-1 p-6 max-w-6xl mx-auto">
            <div className="rounded-2xl border border-red-200 bg-white p-4 text-red-700">
              {error || "Quiz or questions not found."}
              <button
                onClick={() => navigate("/studentquiz")}
                className="ml-4 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                aria-label="Back to quizzes"
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-fuchsia-50 via-white to-indigo-50 flex">
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

        <div className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto">
          {/* Header with timer card */}
          <div className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="col-span-2 bg-white shadow-md rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {quiz.quiz_title || quiz.title || "Quiz"}
                  </h1>
                  <div className="mt-1 text-sm text-slate-600">
                    <span className="mr-3">
                      Subject:{" "}
                      <span className="font-medium">
                        {quiz.subject?.name || "-"}
                      </span>
                    </span>
                    <span className="mr-3">
                      Time Limit:{" "}
                      <span className="font-medium">
                        {Number(quiz.time_limit || 0)} mins
                      </span>
                    </span>
                    <span>
                      Answered:{" "}
                      <span className="font-medium">
                        {answeredCount}/{totalQuestions}
                      </span>
                    </span>
                    {flaggedCount > 0 && (
                      <span className="ml-3 inline-flex items-center gap-1 text-amber-600">
                        <FlagIcon className="h-4 w-4" /> {flaggedCount} flagged
                      </span>
                    )}
                  </div>
                  <div className="mt-3 w-full bg-slate-100 rounded-full h-2" aria-label="Answered progress">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-600 transition-all"
                      style={{ width: `${answeredPct}%` }}
                      title={`${answeredPct}% answered`}
                    />
                  </div>
                </div>
                <TimerCard mmss={mmss} totalSec={totalSec} timeLeft={timeLeft} pct={timerPct} />
              </div>
            </div>

            {/* Quick status card */}
            <div className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white rounded-2xl shadow-md p-5">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-6 w-6" aria-hidden />
                <div>
                  <div className="text-sm opacity-90">Progress</div>
                  <div className="text-2xl font-semibold">{answeredPct}%</div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Answered</span>
                  <span className="font-medium">{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Flagged</span>
                  <span className="font-medium">{flaggedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span className="font-medium">{totalQuestions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: question/answers */}
            <div className="lg:col-span-2 bg-white shadow-md rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  Question {activeIndex + 1} of {totalQuestions}
                </h2>
                <button
                  onClick={toggleFlag}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                    currentQuestion.flagged
                      ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  title={currentQuestion.flagged ? "Unflag question" : "Flag for review"}
                  aria-pressed={currentQuestion.flagged}
                  aria-label={currentQuestion.flagged ? "Unflag question" : "Flag question for review"}
                >
                  <FlagIcon className={`h-4 w-4 ${currentQuestion.flagged ? "text-amber-600" : ""}`} aria-hidden />
                  {currentQuestion.flagged ? "Flagged" : "Flag for review"}
                </button>
              </div>

              <p className="mt-3 text-lg text-slate-800">{currentQuestion.question_text}</p>

              <div className="grid sm:grid-cols-1 gap-3 mt-5" role="radiogroup" aria-label="Answer options">
                {currentQuestion.options?.map((option, idx) => {
                  const selected = currentQuestion.selectedOptionId === option.id;
                  return (
                    <div
                      key={option.id}
                      className={`p-4 border rounded-xl cursor-pointer transition group ${
                        selected
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                      }`}
                      onClick={() => onSelect(currentQuestion.id, option.id)}
                      role="radio"
                      aria-checked={selected}
                      aria-label={`Option ${letters[idx] || idx + 1}: ${option.option_text}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") onSelect(currentQuestion.id, option.id);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            selected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {letters[idx] || idx + 1}
                        </div>
                        <span className="text-slate-800">{option.option_text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
                <button
                  disabled={activeIndex === 0}
                  onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-xl disabled:opacity-50 hover:bg-slate-200 transition"
                  aria-label="Previous question"
                >
                  <ChevronLeftIcon className="h-5 w-5" /> Previous
                </button>

                {activeIndex < qList.length - 1 ? (
                  <button
                    onClick={() => setActiveIndex((i) => Math.min(qList.length - 1, i + 1))}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white rounded-xl hover:from-indigo-700 hover:to-fuchsia-700 transition"
                    aria-label="Next question"
                  >
                    Next <ChevronRightIcon className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition"
                    aria-label="Submit quiz"
                  >
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                )}
              </div>
            </div>

            {/* Right: navigator + legend */}
            <div className="lg:col-span-1">
              {/* Timer mini-card for small screens */}
              <div className="lg:hidden mb-4 bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-6 w-6 text-indigo-600" aria-hidden />
                  <span className="text-lg font-semibold">{endAt ? mmss : "No limit"}</span>
                </div>
                {endAt && (
                  <div className="w-24 bg-slate-200 rounded-full h-2" aria-label="Time used">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-600"
                      style={{ width: `${timerPct}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Navigator */}
              <div className="bg-white rounded-2xl shadow-md p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Questions</h3>

                {/* Legend */}
                <div className="flex items-center gap-3 text-xs mb-3" aria-hidden>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-emerald-200 inline-block" /> Answered
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-amber-200 inline-block" /> Flagged
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-slate-200 inline-block" /> Unanswered
                  </span>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2" role="listbox" aria-label="Question navigator">
                  {qList.map((q, idx) => {
                    const answered = q.selectedOptionId != null;
                    const flagged = q.flagged;
                    const active = idx === activeIndex;

                    let styles = "bg-slate-100 text-slate-800";
                    if (answered) styles = "bg-emerald-200 text-emerald-900";
                    if (flagged) styles = "bg-amber-200 text-amber-900";
                    if (active) styles = "ring-2 ring-indigo-500 " + styles;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setActiveIndex(idx)}
                        className={`relative h-9 w-9 rounded-full text-sm font-semibold ${styles} hover:brightness-95 transition`}
                        title={`${answered ? "Answered" : "Not answered"}${flagged ? " • Flagged" : ""}`}
                        role="option"
                        aria-selected={active}
                        aria-label={`Question ${idx + 1}`}
                      >
                        {idx + 1}
                        {flagged && (
                          <FlagIcon className="h-3.5 w-3.5 absolute -top-1 -right-1 text-amber-700" aria-hidden />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="text-sm text-slate-600">Progress</div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1" aria-label="Answered progress overall">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600"
                      style={{ width: `${answeredPct}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {answeredCount}/{totalQuestions} answered
                  </div>

                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting || answeredCount === 0}
                    className="w-full mt-4 py-2 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
                    aria-label="Submit quiz"
                  >
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                </div>
              </div>

              {/* Tips */}
              {endAt && timeLeft > 0 && timeLeft < 60 && (
                <div className="mt-4 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3" role="alert" aria-live="polite">
                  <ExclamationTriangleIcon className="h-5 w-5" aria-hidden />
                  Time is running out!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

/* ---------------- Timer Card ---------------- */
function TimerCard({ mmss, totalSec, timeLeft, pct }) {
  const noLimit = !totalSec;
  return (
    <div className="w-full sm:w-auto sm:min-w-[220px] bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white rounded-2xl shadow-md p-4" aria-live="polite">
      <div className="flex items-center gap-2">
        <ClockIcon className="h-6 w-6" aria-hidden />
        <div className="text-sm opacity-90">Time Remaining</div>
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight">
        {noLimit ? "No limit" : mmss}
      </div>
      {!noLimit && (
        <div className="mt-3">
          <div className="w-full bg-white/20 rounded-full h-2" aria-label="Time used">
            <div className="h-2 rounded-full bg-white" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1 text-xs opacity-90">{Math.max(0, timeLeft)} seconds</div>
        </div>
      )}
    </div>
  );
}