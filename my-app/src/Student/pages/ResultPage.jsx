import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../Admin/common/api";
import { AuthContext } from "../../context/Auth";

// Lazy Sidebar
const Sidebar = lazy(() => import("../component/Sidebar"));

import {
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiAward,
  FiStar,
  FiClock,
  FiUser,
  FiBookOpen,
  FiBook,
  FiCheck,
  FiX,
} from "react-icons/fi";

/* ---------------- Utilities ---------------- */
const extractApiError = (e) =>
  e?.response?.data?.message ||
  e?.response?.data?.error ||
  (e?.response?.data?.errors
    ? Object.values(e.response.data.errors).flat().join(" ")
    : "") ||
  e?.message ||
  "Request failed";

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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex">
          <div className="flex-1 p-6 max-w-4xl mx-auto flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <FiXCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600">Please refresh and try again.</p>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------------- Main Component ---------------- */
export default function StudentQuizReview() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [summary, setSummary] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [teacherName, setTeacherName] = useState("");

  const studentName = useMemo(
    () => user?.name || user?.user?.name || "Student",
    [user]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const studentId = user?.id || user?.user?.id;
      if (!studentId) {
        throw new Error("Student not found. Please log in again.");
      }

      // GET /students/{studentId}/quizzes/{quizId}/review
      const res = await api.get(
        `students/${studentId}/quizzes/${quizId}/review`
      );

      const data = res?.data || {};
      setAttempt(data?.attempt || null);
      setSummary(data?.summary || null);
      setQuestions(Array.isArray(data?.questions) ? data.questions : []);

      // Teacher name (string from API)
      const teacherNameFromResponse =
        data?.attempt?.quiz?.teacher || "Unknown Teacher";
      setTeacherName(teacherNameFromResponse);
    } catch (e) {
      const msg = extractApiError(e) || "Failed to load review";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [quizId, user?.id, user?.user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const percent = summary?.percent ?? attempt?.score ?? 0;

  const performanceVibe = useMemo(() => {
    if (percent >= 90)
      return {
        title: "Outstanding! 🌟",
        subtitle: "You've mastered this material!",
        color: "bg-gradient-to-r from-emerald-400 to-teal-500",
        textColor: "text-emerald-50",
        icon: <FiAward className="h-6 w-6" />,
      };
    if (percent >= 75)
      return {
        title: "Great Job! 🏆",
        subtitle: "Strong performance with room to grow",
        color: "bg-gradient-to-r from-indigo-400 to-purple-500",
        textColor: "text-indigo-50",
        icon: <FiStar className="h-6 w-6" />,
      };
    if (percent >= 50)
      return {
        title: "Good Effort! 💪",
        subtitle: "You're on the right track",
        color: "bg-gradient-to-r from-amber-400 to-orange-500",
        textColor: "text-amber-50",
        icon: <FiBook className="h-6 w-6" />,
      };
    return {
      title: "Keep Going! 🌱",
      subtitle: "Every attempt is progress",
      color: "bg-gradient-to-r from-rose-400 to-pink-500",
      textColor: "text-rose-50",
      icon: <FiBookOpen className="h-6 w-6" />,
    };
  }, [percent]);

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex">
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
          <div className="flex-1 p-6 max-w-4xl mx-auto space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="h-8 bg-gray-200 rounded-lg w-2/3 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-2xl shadow-sm animate-pulse"></div>
            ))}
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (error || !attempt) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex">
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
          <div className="flex-1 p-6 max-w-4xl mx-auto flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <FiXCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {error || "Result not found"}
              </h2>
              <p className="text-gray-600 mb-6">
                We couldn't retrieve your quiz results
              </p>
              <button
                onClick={() => navigate("/studentquiz")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center justify-center mx-auto"
                aria-label="Back to quizzes"
              >
                <FiArrowLeft className="mr-2" />
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex">
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

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate("/studentquiz1")}
              className="flex items-center text-indigo-600 hover:text-indigo-700 transition p-2 rounded-lg hover:bg-indigo-50 mr-4"
              aria-label="Back to quizzes"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Quiz Results</h1>
          </div>

          {/* Student Card */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <FiUser className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Student</p>
                <h2 className="text-xl font-medium text-gray-900">{studentName}</h2>
              </div>
            </div>
          </div>

          {/* Quiz Summary Card */}
          <div className={`${performanceVibe.color} text-white rounded-2xl shadow-lg p-6 mb-6`}>
            <div className="bg-white rounded-2xl shadow-xl p-6 flex justify-between items-start relative overflow-hidden">
              {/* Decorative */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-100/40 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-100/40 rounded-full blur-3xl"></div>

              {/* Left Info */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <FiBookOpen className="mr-2 text-indigo-400" />
                  <span>Subject</span>
                  <span className="ml-2 font-semibold">
                    {attempt?.quiz?.subject || "General Knowledge"}
                  </span>
                </div>

                <div className="flex items-center text-lg font-bold text-gray-800">
                  <FiBook className="mr-2 text-purple-400" />
                  <span>Quiz</span>
                  <span className="ml-2">{attempt?.quiz?.title || "Untitled Quiz"}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 opacity-90">
                  <FiUser className="mr-2 text-green-400" />
                  <span>Teacher</span>
                  <span className="ml-2 font-medium">{teacherName}</span>
                </div>
              </div>

              {/* Right Icon */}
              <div className="relative z-10 flex items-center justify-center bg-indigo-50/70 rounded-full w-16 h-16 shadow-lg">
                {performanceVibe.icon}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Score Section */}
              <div className="bg-white/20 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Your Score</span>
                  <span className="text-2xl font-bold">{percent}%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2 mb-1">
                  <div
                    className="h-2 rounded-full bg-white"
                    style={{ width: `${percent}%` }}
                    aria-label="Score progress"
                  />
                </div>
                <div className="text-xs opacity-90">
                  {summary?.correct}/{summary?.total} correct answers
                </div>
              </div>

              {/* Completion Time */}
              <div className="bg-white/20 rounded-xl p-4">
                <div className="flex items-center text-sm mb-2">
                  <FiClock className="mr-2" />
                  <span>Completed</span>
                </div>
                <div className="text-md font-medium">
                  {attempt?.finished_at
                    ? new Date(attempt.finished_at).toLocaleString()
                    : "-"}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/20">
              <h3 className="font-semibold text-lg">{performanceVibe.title}</h3>
              <p className="text-sm opacity-90 mt-1">{performanceVibe.subtitle}</p>
            </div>
          </div>

          {/* Questions Review Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Question Review</h2>
              <span className="text-sm text-gray-500">{questions.length} questions</span>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const isCorrect = q.is_correct;
                const selectedId = q.selected_option_id;
                return (
                  <div key={q.id} className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="bg-gray-100 text-gray-700 rounded-lg w-8 h-8 flex items-center justify-center font-medium mr-3">
                          {idx + 1}
                        </div>
                        <h3 className="text-gray-900 font-medium">{q.question_text}</h3>
                      </div>
                      <div
                        className={`flex items-center text-sm px-3 py-1 rounded-full ${
                          isCorrect
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {isCorrect ? (
                          <FiCheck className="h-4 w-4 mr-1" />
                        ) : (
                          <FiX className="h-4 w-4 mr-1" />
                        )}
                        {isCorrect ? "Correct" : "Incorrect"}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {q.options.map((opt) => {
                        const isSel = selectedId === opt.id;
                        const isCor = !!opt.is_correct;

                        let optionStyle = "border-gray-200 bg-white";
                        if (isSel && isCor) optionStyle = "border-emerald-400 bg-emerald-50";
                        else if (isSel && !isCor) optionStyle = "border-rose-400 bg-rose-50";
                        else if (!isSel && isCor) optionStyle = "border-emerald-300 bg-emerald-50/50";

                        return (
                          <div
                            key={opt.id}
                            className={`p-4 border rounded-xl flex items-center justify-between ${optionStyle}`}
                          >
                            <span className="text-gray-800">{opt.option_text}</span>
                            <span className="text-xs font-medium">
                              {isSel
                                ? isCor
                                  ? "Your answer ✓"
                                  : "Your answer"
                                : isCor
                                ? "Correct answer ✓"
                                : ""}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Motivational Footer */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-start">
              <div className="bg-indigo-100 p-2 rounded-lg mr-4 flex-shrink-0">
                <FiStar className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Review Complete!</h3>
                <p className="text-gray-600 text-sm">
                  Great work reviewing your answers! Use these insights to focus on areas that need
                  improvement. Remember, every review session makes you stronger. Keep up the good
                  work! 💫
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}