// src/Student/pages/Home.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/Auth";
import { apiurl } from "../../Admin/common/Http";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import {
  FaSearch,
  FaBell,
  FaCheckCircle,
  FaBookOpen,
  FaChartLine,
  FaExclamationTriangle,
  FaChevronRight,
  FaSyncAlt,
  FaTrophy,
  FaMedal,
  FaAward,
  FaGraduationCap,
  FaStar,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

/* ===================== Main Component ===================== */
export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user?.id || !user?.token) return;
    let mounted = true;

    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Base attempts
        const res = await axios.get(`${apiurl}students/${user.id}/quizzes`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const base = res?.data?.data ?? res?.data ?? [];

        // Hydrate quiz subject + teacher if missing by fetching /quizzes/:id
        const ids = Array.from(
          new Set(
            base
              .map((x) => x.quiz_id || x?.quiz?.id)
              .filter(Boolean)
          )
        );

        const detailsMap = {};
        await Promise.all(
          ids.map(async (qid) => {
            try {
              const qRes = await axios.get(`${apiurl}quizzes/${qid}`, {
                headers: { Authorization: `Bearer ${user.token}` },
              });
              detailsMap[qid] = qRes?.data?.data ?? qRes?.data ?? null;
            } catch {
              // ignore individual quiz fetch errors
            }
          })
        );

        const enriched = base.map((item) => {
          const quiz =
            item.quiz ||
            detailsMap[item.quiz_id] ||
            (item.quiz?.id ? detailsMap[item.quiz.id] : null) ||
            null;
          return { ...item, quiz };
        });

        const normalized = normalizeQuizzes(enriched);
        if (mounted) setQuizzes(normalized);
      } catch (e) {
        console.error("Fetch quizzes failed:", e?.response?.data || e.message);
        if (mounted) setError("Could not load your completed quizzes. Please retry.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchQuizzes();
    return () => {
      mounted = false;
    };
  }, [user?.id, user?.token]);

  // Completed only
  const completed = useMemo(
    () => quizzes.filter((q) => q.status === "completed"),
    [quizzes]
  );

  // Stats
  const stats = useMemo(() => {
    const scores = completed
      .map((q) => q.scorePercent)
      .filter((x) => typeof x === "number");
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const highScore = scores.length ? Math.max(...scores) : 0;

    const gradeDistribution = {
      a: scores.filter((s) => s >= 90).length,
      b: scores.filter((s) => s >= 80 && s < 90).length,
      c: scores.filter((s) => s >= 70 && s < 80).length,
      d: scores.filter((s) => s >= 60 && s < 70).length,
      f: scores.filter((s) => s < 60).length,
    };

    const subjectScores = {};
    completed.forEach((q) => {
      if (typeof q.scorePercent === "number") {
        subjectScores[q.subjectName] ??= { total: 0, count: 0 };
        subjectScores[q.subjectName].total += q.scorePercent;
        subjectScores[q.subjectName].count += 1;
      }
    });

    let bestSubject = "N/A";
    let bestSubjectAvg = 0;
    Object.entries(subjectScores).forEach(([name, data]) => {
      const avg = Math.round(data.total / data.count);
      if (avg > bestSubjectAvg) {
        bestSubjectAvg = avg;
        bestSubject = name;
      }
    });

    return {
      avgScore,
      highScore,
      gradeDistribution,
      bestSubject: { name: bestSubject, avg: bestSubjectAvg },
      totalQuizzes: completed.length,
      subjectsCovered: new Set(completed.map((q) => q.subjectName)).size,
    };
  }, [completed]);

  // Search + sort by most recent
  const filteredQuizzes = useMemo(() => {
    let list = completed;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.subjectName.toLowerCase().includes(q) ||
          i.teacherName.toLowerCase().includes(q)
      );
    }
    return list.slice().sort((a, b) => (b.finishedAtTs || 0) - (a.finishedAtTs || 0));
  }, [completed, query]);

  const firstName = (user?.name || "Student").split(" ")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex text-gray-800">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full max-w-md">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search completed quizzes by title, subject or teacher..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                <FaGraduationCap className="text-indigo-600" />
                <span className="text-sm font-medium">{user?.name || "Student"}</span>
              </div>
              <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
                <FaBell className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8">
          {/* Greeting */}
          <section className="mb-8">
            <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Outstanding work, {firstName}! 🎓</h1>
                <p className="text-white/90 max-w-lg">
                  You've completed {completed.length} quizzes with an average score of {stats.avgScore}%.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <QuickPill icon={<FaTrophy />} label={`${stats.highScore}% High Score`} />
                <QuickPill icon={<FaCheckCircle />} label={`${completed.length} Completed`} />
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Completed Quizzes"
              value={stats.totalQuizzes}
              icon={<FaCheckCircle className="text-green-600" />}
              color="bg-green-100"
              borderColor="border-green-200"
            />
            <StatCard
              title="Average Score"
              value={`${stats.avgScore}%`}
              icon={<FaChartLine className="text-blue-600" />}
              color="bg-blue-100"
              borderColor="border-blue-200"
              subtitle="Across all quizzes"
            />
            <StatCard
              title="Highest Score"
              value={stats.highScore > 0 ? `${stats.highScore}%` : "N/A"}
              icon={<FaTrophy className="text-amber-600" />}
              color="bg-amber-100"
              borderColor="border-amber-200"
              subtitle="Your personal best"
            />
            <StatCard
              title="Subjects Covered"
              value={stats.subjectsCovered}
              icon={<FaBookOpen className="text-indigo-600" />}
              color="bg-indigo-100"
              borderColor="border-indigo-200"
              subtitle="Different subjects"
            />
          </section>

          {/* Performance Summary */}
          {completed.length > 0 && (
            <section className="mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FaStar className="text-amber-500" /> Your Performance Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Grade Distribution */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Grade Distribution</h3>
                    <div className="space-y-2">
                      {[
                        { grade: "A (90-100%)", count: stats.gradeDistribution.a, color: "bg-green-500" },
                        { grade: "B (80-89%)", count: stats.gradeDistribution.b, color: "bg-blue-500" },
                        { grade: "C (70-79%)", count: stats.gradeDistribution.c, color: "bg-amber-500" },
                        { grade: "D (60-69%)", count: stats.gradeDistribution.d, color: "bg-orange-500" },
                        { grade: "F (<60%)", count: stats.gradeDistribution.f, color: "bg-red-500" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{item.grade}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${item.color}`}
                                style={{ width: `${(completed.length ? (item.count / completed.length) : 0) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium w-6 text-right">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best Subject */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Strongest Subject</h3>
                    {stats.bestSubject.name !== "N/A" ? (
                      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-100 p-3 rounded-full">
                            <FaAward className="text-indigo-600 text-xl" />
                          </div>
                          <div>
                            <h4 className="font-bold text-indigo-800">{stats.bestSubject.name}</h4>
                            <p className="text-sm text-indigo-600">Average score: {stats.bestSubject.avg}%</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Not enough data to determine your strongest subject</p>
                    )}

                    <h3 className="font-semibold text-gray-700 mt-6 mb-3">Recent Achievement</h3>
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-3 rounded-full">
                          <FaMedal className="text-amber-600 text-xl" />
                        </div>
                        <div>
                          <h4 className="font-bold text-amber-800">Quiz Master</h4>
                          <p className="text-sm text-amber-600">Completed {completed.length} quizzes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Completed Quizzes List */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaCheckCircle className="text-green-600" /> Your Completed Quizzes
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2">
                  {filteredQuizzes.length}
                </span>
              </h2>
              <div className="text-sm text-gray-500">
                Sorted by: <span className="font-medium">Most Recent</span>
              </div>
            </div>

            {loading ? (
              <Loader />
            ) : error ? (
              <ErrorState error={error} />
            ) : filteredQuizzes.length === 0 ? (
              <EmptyState hasQuery={query.trim().length > 0} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <QuizResultCard
                    key={quiz.id}
                    quiz={quiz}
                    onReview={() => navigate(`/quiz/${quiz.quizId}/review`)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/* ===================== Supporting Components ===================== */

function StatCard({ title, value, icon, color, borderColor, subtitle }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${borderColor} p-5 transition-transform hover:scale-[1.02]`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>{icon}</div>
      </div>
    </div>
  );
}

function QuickPill({ icon, label }) {
  return (
    <div className="flex items-center gap-2 bg-white/20 text-white rounded-full px-4 py-2 backdrop-blur-sm transition-all">
      <span className="text-sm">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function Loader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-2xl p-5 bg-white animate-pulse">
          <div className="h-6 w-2/3 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
          <div className="h-3 w-full bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-4/5 bg-gray-200 rounded mb-2"></div>
          <div className="h-2 w-3/5 bg-gray-200 rounded mb-4"></div>
          <div className="h-3 w-full bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="bg-white border border-red-200 text-red-700 rounded-2xl p-6 flex items-start gap-4">
      <div className="bg-red-100 p-3 rounded-full">
        <FaExclamationTriangle className="text-red-600" />
      </div>
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

function EmptyState({ hasQuery }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
      <div className="text-5xl mb-4">📊</div>
      <p className="font-semibold text-lg mb-1">
        {hasQuery ? "No matching quizzes found" : "No completed quizzes yet"}
      </p>
      <p className="text-sm text-gray-600 max-w-md mx-auto">
        {hasQuery
          ? "Try adjusting your search terms to find what you're looking for."
          : "Once you complete some quizzes, they'll appear here with your results and statistics."}
      </p>
    </div>
  );
}

function QuizResultCard({ quiz, onReview }) {
  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-amber-600 bg-amber-100";
    if (score >= 60) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const scoreColor = getScoreColor(quiz.scorePercent);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{quiz.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <FaBookOpen size={12} />
            <span>{quiz.subjectName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaGraduationCap size={12} />
            <span>{quiz.teacherName}</span>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${scoreColor}`}>{quiz.scorePercent}%</span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        {quiz.finishedAt && (
          <div className="flex items-center gap-1">
            <FaCalendarAlt size={12} />
            <span>{quiz.finishedAt}</span>
          </div>
        )}
        {quiz.durationMinutes && (
          <div className="flex items-center gap-1">
            <FaClock size={12} />
            <span>{quiz.durationMinutes}m</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">{quiz.questionsCount ? `${quiz.questionsCount} questions` : ""}</div>
        <button
          onClick={onReview}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          Review results <FaChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

/* ============= Normalization Utils ============= */
function normalizeQuizzes(items) {
  return items.map((i) => {
    const quizObj = i.quiz || i;
    const quizId = i.quiz_id ?? quizObj.id ?? null;
    const attemptId = i.id ?? quizId;

    const title = quizObj.quiz_title || quizObj.title || "Untitled Quiz";
    const subjectName =
      quizObj?.subject?.name || i?.quiz?.subject?.name || i?.subject_name || "General";
    const teacherName =
      quizObj?.teacher?.name || i?.quiz?.teacher?.name || i?.teacher_name || "Teacher";

    const rawStatus = (i.status || quizObj.status || (i.finished ? "completed" : "")).toLowerCase();
    const status = rawStatus || "completed";

    const score = typeof i.score === "number" ? i.score : null;
    const totalScore = i.total_score ?? 100;
    const scorePercent = typeof score === "number" ? Math.round((score / totalScore) * 100) : null;

    const durationMinutes = quizObj.duration_minutes || quizObj.time_limit || null;
    const questionsCount = quizObj.question_count || i.total_questions || null;

    const finishedAtTs = i.finished_at ? new Date(i.finished_at).getTime() : null;
    const finishedAt = i.finished_at
      ? new Date(i.finished_at).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

    return {
      id: attemptId,
      quizId,
      title,
      subjectName,
      teacherName,
      status,
      scorePercent,
      durationMinutes,
      questionsCount,
      finishedAt,
      finishedAtTs,
    };
  });
}