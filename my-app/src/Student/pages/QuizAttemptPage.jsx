import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import { apiurl } from "../../Admin/common/Http";
import { toast } from "react-toastify";

/* Helpers */
const normalizeBase = (base) => (typeof base === "string" ? base.replace(/\/+$/, "") + "/" : "/");
const API_ROOT = normalizeBase(apiurl);

const resolveToken = () => {
  try {
    const raw = localStorage.getItem("userInfo");
    if (raw) {
      const obj = JSON.parse(raw);
      return obj?.token || "";
    }
  } catch {}
  return "";
};

const makeHeaders = () => {
  const h = new Headers();
  h.set("Accept", "application/json");
  h.set("Content-Type", "application/json");
  const tk = resolveToken();
  if (tk) h.set("Authorization", `Bearer ${tk}`);
  return h;
};

const fetchJSON = async (url, opts = {}) => {
  const res = await fetch(url, { ...opts, headers: makeHeaders() });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
};

export default function QuizAttemptPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [qList, setQList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [studentId, setStudentId] = useState(null);

  // Get student ID from user info
  useEffect(() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (userInfo && userInfo.user && userInfo.user.id) {
        setStudentId(userInfo.user.id);
      }
    } catch (e) {
      console.error("Failed to get student ID", e);
    }
  }, []);

  // Load quiz + questions + options
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // GET /quizzes/:id
        const quizData = await fetchJSON(`${API_ROOT}quizzes/${quizId}`);
        const meta = quizData?.data || quizData || {};
        setQuiz(meta);
        const limit = Number(meta.time_limit || 0);
        setTimeLeft(limit > 0 ? limit * 60 : 0);

        // GET /questions?quiz_id=:id
        const questionsData = await fetchJSON(`${API_ROOT}questions?quiz_id=${quizId}`);
        const questions = Array.isArray(questionsData?.data) ? questionsData.data :
                          Array.isArray(questionsData) ? questionsData : [];

        // Fetch options for each question (GET /options?question_id=:qid)
        const optionPromises = questions.map((q) =>
          fetchJSON(`${API_ROOT}options?question_id=${q.id}`).catch(() => [])
        );
        const optionsArr = await Promise.all(optionPromises);

        const normalized = questions.map((q, idx) => {
          const options = Array.isArray(optionsArr[idx]?.data)
            ? optionsArr[idx].data
            : Array.isArray(optionsArr[idx])
            ? optionsArr[idx]
            : [];

          return {
            id: q.id,
            question_text: q.question_text || q.text || "",
            options: options.map((o) => ({
              id: o.id,
              option_text: o.option_text || o.text || "",
              is_correct: o.is_correct ?? null,
            })),
            selectedOptionId: null,
          };
        });

        setQList(normalized);
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load quiz");
        toast.error("Failed to load quiz: " + e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId]);

  // Timer
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          handleSubmit(true).catch(() => {});
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const mmss = useMemo(() => {
    const m = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  const answeredCount = useMemo(
    () => qList.filter((q) => q.selectedOptionId != null).length,
    [qList]
  );

  const currentIndex = useMemo(
    () => qList.findIndex((q) => q.selectedOptionId == null),
    [qList]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (qList.length && activeIndex === 0 && currentIndex > 0) {
      setActiveIndex(currentIndex);
    }
  }, [qList, activeIndex, currentIndex]);

  const currentQuestion = qList[activeIndex];

  const onSelect = (qid, oid) => {
    setQList((prev) =>
      prev.map((q) => (q.id === qid ? { ...q, selectedOptionId: oid } : q))
    );
  };

  // Calculate score and save to backend
  const handleSubmit = async (auto = false) => {
    if (!studentId) {
      toast.error("Student information not found. Please log in again.");
      return;
    }

    setSubmitting(true);
    try {
      // Calculate score
      let score = 0;
      let total = qList.length;

      for (const q of qList) {
        const opt = q.options.find((o) => o.id === q.selectedOptionId);
        if (opt && String(opt.is_correct) === "1") score += 1;
        if (opt && opt.is_correct === true) score += 1;
      }

      // Calculate percentage score
      const percentageScore = total > 0 ? Math.round((score / total) * 100) : 0;
      
      // Save to backend using the student-quizzes endpoint
      const submissionData = {
        student_id: studentId,
        quiz_id: parseInt(quizId),
        score: percentageScore
      };

      // POST to student-quizzes endpoint
      const result = await fetchJSON(`${API_ROOT}student-quizzes`, {
        method: 'POST',
        body: JSON.stringify(submissionData)
      });

      toast.success(`Quiz submitted successfully! Your score: ${percentageScore}%`);
      navigate("/studentquiz");
      
    } catch (e) {
      console.error("Submission error:", e);
      if (!auto) {
        toast.error(e.message || "Submission failed");
      } else {
        // For auto-submission, try to save at least the attempt
        try {
          const submissionData = {
            student_id: studentId,
            quiz_id: parseInt(quizId),
            score: 0 // Default to 0 for auto-submission
          };
          await fetchJSON(`${API_ROOT}student-quizzes`, {
            method: 'POST',
            body: JSON.stringify(submissionData)
          });
        } catch (fallbackError) {
          console.error("Fallback submission also failed:", fallbackError);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 p-6 max-w-6xl mx-auto">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-200/70 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz || qList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 p-6 max-w-6xl mx-auto">
          <div className="rounded-2xl border border-red-200 bg-white p-4 text-red-700">
            {error || "Quiz or questions not found."}
            <button 
              onClick={() => navigate('/studentquiz')}
              className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-md"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-6 max-w-6xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{quiz.quiz_title || quiz.title || "Quiz"}</h1>
            <p>Subject: {quiz.subject?.name || "-"}</p>
            <p className="text-sm text-gray-600">Time Limit: {quiz.time_limit} minutes</p>
          </div>
          <div
            className={`text-2xl font-bold ${
              timeLeft > 0 && timeLeft < 300 ? "text-red-600" : "text-gray-800"
            }`}
          >
            {timeLeft > 0 ? mmss : "00:00"}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: question navigator */}
          <div className="lg:w-1/4 bg-white shadow-md rounded-lg p-4 h-fit">
            <h2 className="font-semibold mb-4">Questions</h2>
            <div className="grid grid-cols-5 gap-2">
              {qList.map((q, idx) => {
                const answered = q.selectedOptionId != null;
                const active = idx === activeIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      active
                        ? "bg-blue-600 text-white"
                        : answered
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-slate-700"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-slate-600">
                Progress: {answeredCount}/{qList.length}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(answeredCount / qList.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting || answeredCount === 0}
              className="w-full mt-6 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
            
            {timeLeft > 0 && timeLeft < 60 && (
              <div className="mt-2 text-sm text-red-600">
                Time is running out!
              </div>
            )}
          </div>

          {/* Right: active question */}
          <div className="lg:w-3/4 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold">
              Question {activeIndex + 1} of {qList.length}
            </h2>
            <p className="mt-2 text-lg">{currentQuestion.question_text}</p>

            <div className="space-y-3 mt-4">
              {currentQuestion.options?.map((option) => {
                const selected = currentQuestion.selectedOptionId === option.id;
                return (
                  <div
                    key={option.id}
                    className={`p-4 border rounded-md cursor-pointer transition ${
                      selected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                    onClick={() => onSelect(currentQuestion.id, option.id)}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 border rounded-full mr-3 flex items-center justify-center ${
                          selected ? "bg-blue-500 border-blue-500" : "border-gray-400"
                        }`}
                      >
                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-gray-800">{option.option_text}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between mt-6">
              <button
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300 transition"
              >
                Previous
              </button>
              
              {activeIndex < qList.length - 1 ? (
                <button
                  onClick={() => setActiveIndex((i) => Math.min(qList.length - 1, i + 1))}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {submitting ? "Submitting..." : "Submit Quiz"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}