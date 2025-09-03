import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiurl } from "../../Admin/common/Http";
import Sidebar from "../component/Sidebar";
import { toast } from "react-toastify";
import {
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiAward,
  FiStar,
  FiClock,
  FiUser,
  FiBookOpen,
  FiBarChart2
} from "react-icons/fi";

const API_ROOT = apiurl.replace(/\/+$/, "") + "/";

const resolveToken = () => {
  try { return JSON.parse(localStorage.getItem("userInfo"))?.token || ""; } catch { return ""; }
};
const makeHeaders = () => {
  const h = new Headers();
  h.set("Accept", "application/json");
  const tk = resolveToken();
  if (tk) h.set("Authorization", `Bearer ${tk}`);
  return h;
};
const fetchJSON = async (url) => {
  const res = await fetch(url, { headers: makeHeaders() });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const e = await res.json(); msg = e?.message || e?.error || JSON.stringify(e) || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
};

export default function StudentQuizReview() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [summary, setSummary] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    // Get student name from localStorage
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const name = userInfo?.name || userInfo?.user?.name || "Student";
      setStudentName(name);
    } catch {
      setStudentName("Student");
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // resolve student id
        let studentId = null;
        try {
          const u = JSON.parse(localStorage.getItem("userInfo"));
          studentId = u?.id || u?.user?.id || null;
        } catch {}

        if (!studentId) throw new Error("Student not found. Please log in again.");

        const data = await fetchJSON(`${API_ROOT}students/${studentId}/quizzes/${quizId}/review`);
        setAttempt(data?.attempt || null);
        setSummary(data?.summary || null);
        setQuestions(Array.isArray(data?.questions) ? data.questions : []);
      } catch (e) {
        setError(e.message || "Failed to load review");
        toast.error(e.message || "Failed to load review");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId]);

  const percent = summary?.percent ?? 0;

  const vibe = useMemo(() => {
    if (percent >= 90) return { 
      title: "Outstanding! 🌟", 
      text: "You crushed it. Keep the momentum!", 
      color: "bg-gradient-to-r from-emerald-400 to-teal-500",
      emoji: "🌟"
    };
    if (percent >= 75) return { 
      title: "Great Job! 🏆", 
      text: "Strong performance. A little more practice and you'll ace it!", 
      color: "bg-gradient-to-r from-indigo-400 to-purple-500",
      emoji: "🏆"
    };
    if (percent >= 50) return { 
      title: "Good Effort! 💪", 
      text: "You're getting there. Review mistakes and try again.", 
      color: "bg-gradient-to-r from-amber-400 to-orange-500",
      emoji: "💪"
    };
    return { 
      title: "Don't Give Up! 🌱", 
      text: "Every attempt is progress. Revisit concepts and keep going.", 
      color: "bg-gradient-to-r from-rose-400 to-pink-500",
      emoji: "🌱"
    };
  }, [percent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex">
        <Sidebar />
        <div className="flex-1 p-6 max-w-6xl mx-auto">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/70 rounded-2xl animate-pulse shadow-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex">
        <Sidebar />
        <div className="flex-1 p-6 max-w-6xl mx-auto">
          <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-700 shadow-sm">
            {error || "Result not found."}
            <button onClick={() => navigate("/studentquiz")} className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Header with Student Name */}
        <div className="flex items-center mb-6">
          <div className="rounded-full bg-white p-3 shadow-sm flex items-center justify-center mr-3">
            <FiUser className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm text-gray-500">Good job,</h2>
            <h1 className="text-xl font-semibold text-gray-800">{studentName}</h1>
          </div>
        </div>

        {/* Score Card - iOS style */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <FiBookOpen className="mr-1.5" />
                <span>{attempt.quiz?.subject || "General Knowledge"}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{attempt.quiz?.title || "Quiz Review"}</h1>
            </div>
            <div className={`rounded-full p-3 ${vibe.color} text-white shadow-md`}>
              <FiAward className="h-6 w-6" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-500">Score</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">{percent}%</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${vibe.color}`} 
                  style={{ width: `${percent}%` }} 
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-500">Correct Answers</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">
                {summary?.correct}/{summary?.total}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {summary?.correct === summary?.total ? "Perfect score! 🎯" : "Keep practicing!"}
              </div>
            </div>
          </div>

          <div className="flex items-center mt-5 text-sm text-gray-500">
            <FiClock className="mr-1.5" />
            <span>Finished: {attempt.finished_at ? new Date(attempt.finished_at).toLocaleString() : "-"}</span>
          </div>
        </div>

        {/* Performance Message */}
        <div className={`rounded-2xl p-5 text-white mb-6 ${vibe.color} shadow-md`}>
          <div className="flex items-start">
            <span className="text-2xl mr-3">{vibe.emoji}</span>
            <div>
              <h3 className="font-semibold text-lg">{vibe.title}</h3>
              <p className="mt-1 opacity-90">{vibe.text}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/studentquiz")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            <FiArrowLeft className="h-5 w-5" /> Back to Quizzes
          </button>
          
          <div className="flex items-center text-sm text-gray-500">
            <FiBarChart2 className="mr-1.5" />
            <span>Question Review</span>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const isCorrect = q.is_correct;
            const selectedId = q.selected_option_id;
            const correctId = q.options.find(o => o.is_correct)?.id;

            return (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-medium mr-3">
                      {idx + 1}
                    </div>
                    <p className="text-gray-900 font-medium">{q.question_text}</p>
                  </div>
                  <div className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
                    isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {isCorrect ? <FiCheckCircle className="h-4 w-4" /> : <FiXCircle className="h-4 w-4" />}
                    {isCorrect ? "Correct" : "Incorrect"}
                  </div>
                </div>

                <div className="space-y-3">
                  {q.options.map(opt => {
                    const isSel = selectedId === opt.id;
                    const isCor = opt.is_correct;
                    
                    let style = "border-gray-200 bg-white";
                    if (isSel && isCor) style = "border-emerald-400 bg-emerald-50";
                    else if (isSel && !isCor) style = "border-rose-400 bg-rose-50";
                    else if (!isSel && isCor) style = "border-emerald-300 bg-emerald-50/50";

                    return (
                      <div key={opt.id} className={`p-4 border rounded-xl flex items-center justify-between ${style}`}>
                        <span className="text-gray-800">{opt.option_text}</span>
                        <span className="text-xs font-medium">
                          {isSel ? (isCor ? "Your answer ✓" : "Your answer") : isCor ? "Correct answer ✓" : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational footer */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex items-start">
          <div className="rounded-full bg-indigo-100 p-2 mr-4 flex-shrink-0">
            <FiStar className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="text-gray-700">
            <div className="font-medium mb-1">Review Complete!</div>
            <p>Great work reviewing your answers! Use this insight to focus on topics that need improvement. You've got this! 💫</p>
          </div>
        </div>
      </div>
    </div>
  );
}