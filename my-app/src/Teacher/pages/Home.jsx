import React, { useEffect, useState, useContext, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import StatCard from "../components/StatCard";
import ActionButton from "../components/ActionButton";
import PerformanceMetric from "../components/PerformanceMetric";
import QuizCard from "../components/QuizCard";
import NotificationItem from "../components/NotificationItem";
import { apiurl, token as tokenFromLS } from "../../Admin/common/Http";
import { AuthContext } from "../../context/Auth";

/* ---------------- Helpers: API + formatting ---------------- */
const normalizeBase = (base) =>
  typeof base === "string" ? base.replace(/\/+$/, "") + "/" : "/";
const API_ROOT = normalizeBase(apiurl);

const resolveToken = () => {
  try {
    const t = typeof tokenFromLS === "function" ? tokenFromLS() : tokenFromLS;
    if (typeof t === "string") return t;
    if (t && typeof t === "object" && typeof t.token === "string") return t.token;
  } catch {}
  const ls = localStorage.getItem("authToken");
  return typeof ls === "string" ? ls : "";
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
  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  return res.status === 204 ? null : res.json();
};

const parseDate = (v) => (v ? new Date(v) : null);
const statusOf = (q, now = new Date()) => {
  const s = parseDate(q?.start_time || q?.start_at);
  const e = parseDate(q?.end_time || q?.end_at);
  if (s && now < s) return "upcoming";
  if (s && e && now >= s && now <= e) return "ongoing";
  if (e && now > e) return "past";
  return "unknown";
};

/* ---------------- Component ---------------- */
export default function TeacherHome() {
  const { user, login } = useContext(AuthContext);

  const [teacherName, setTeacherName] = useState(user?.name || "Teacher");

  const initials = useMemo(() => {
    return teacherName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "T";
  }, [teacherName]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  }, []);

  // Dashboard data
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState(0);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [performanceStats, setPerformanceStats] = useState({
    averageScore: 0,
    completionRate: 0,
    topPerformingQuiz: "N/A",
  });

  // ------------------ Load teacher name ------------------
  useEffect(() => {
    const authToken = user?.token || resolveToken();
    if (!authToken) return;

    const persist = (next) => {
      try {
        const raw = localStorage.getItem("userInfo");
        const prev = raw ? JSON.parse(raw) : {};
        const merged = { ...prev, ...next };
        localStorage.setItem("userInfo", JSON.stringify(merged));
      } catch {}
      login?.((prev) => (typeof prev === "object" ? { ...prev, ...next } : next));
      if (next.name) setTeacherName(next.name);
    };

    const loadTeacher = async () => {
      let nameAcc = user?.name || null;

      // Try localStorage first
      try {
        const raw = localStorage.getItem("userInfo");
        if (raw) {
          const obj = JSON.parse(raw);
          if (!nameAcc) {
            const n =
              obj?.name ||
              obj?.user?.name ||
              [obj?.first_name, obj?.last_name].filter(Boolean).join(" ");
            if (n && n.trim()) nameAcc = n.trim();
          }
        }
      } catch {}

      // Try /checkauth API
      if (!nameAcc) {
        try {
          const data = await fetchJSON(`${API_ROOT}checkauth`);
          const nameFromApi =
            data?.data?.name ||
            data?.user?.name ||
            data?.name ||
            null;
          if (nameFromApi) persist({ name: nameFromApi });
        } catch (e) {
          console.error("checkauth failed:", e);
        }
      } else {
        setTeacherName(nameAcc);
      }
    };

    loadTeacher();
  }, [user?.token, login]);

  // ------------------ Fetch quizzes ------------------
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingQuizzes(true);
      try {
        const token = resolveToken();
        if (!token) return;

        const data = await fetchJSON(`${API_ROOT}quizzes`);
        if (!mounted) return;

        const quizzes = Array.isArray(data) ? data : data?.data || [];
        setTotalQuizzes(quizzes.length);

        const now = new Date();
        const upcoming = quizzes.filter((q) => statusOf(q, now) === "upcoming").length;
        setUpcomingQuizzes(upcoming);

        const sorted = [...quizzes].sort((a, b) => {
          const A =
            parseDate(a.created_at || a.createdAt || a.start_time || a.start_at)?.getTime() ||
            0;
          const B =
            parseDate(b.created_at || b.createdAt || b.start_time || b.start_at)?.getTime() ||
            0;
          return B - A;
        });
        setRecentQuizzes(sorted.slice(0, 5));

        const avgScores = quizzes
          .map((q) => Number(q.average_score))
          .filter(Number.isFinite);
        const completionRates = quizzes
          .map((q) => Number(q.completion_rate))
          .filter(Number.isFinite);
        const averageScore = avgScores.length
          ? Math.round(avgScores.reduce((a, b) => a + b, 0) / avgScores.length)
          : 0;
        const completionRate = completionRates.length
          ? Math.round(completionRates.reduce((a, b) => a + b, 0) / completionRates.length)
          : 0;
        const topQuiz =
          [...quizzes]
            .filter((q) => Number.isFinite(Number(q.average_score)))
            .sort((a, b) => Number(b.average_score) - Number(a.average_score))[0] || null;

        setPerformanceStats({
          averageScore,
          completionRate,
          topPerformingQuiz: topQuiz?.name || topQuiz?.quiz_title || topQuiz?.title || "N/A",
        });
      } catch (err) {
        console.error("Error fetching quizzes:", err);
      } finally {
        if (mounted) setLoadingQuizzes(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 font-sans text-slate-800 flex">
      <Sidebar teacherName={teacherName} initials={initials} />
      <main className="flex-1 overflow-auto">
        <TopNav notifications={notifications} />
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <section className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              {greeting}, {teacherName}
            </h1>
            <p className="text-slate-600 mt-1">Here’s what’s happening with your quizzes today.</p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Quizzes" value={totalQuizzes} change={loadingQuizzes ? "…" : ""} icon="clipboard" />
            <StatCard title="Active Students" value={totalStudents} change="" icon="students" />
            <StatCard title="Upcoming Quizzes" value={upcomingQuizzes} change="" icon="calendar" />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white/80 backdrop-blur rounded-3xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Quick Actions</h2>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View all</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ActionButton type="createQuiz" />
                <ActionButton type="viewAnalytics" />
                <ActionButton type="manageStudents" />
                <ActionButton type="gradeSubmissions" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-3xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Class Performance</h2>
              <PerformanceMetric label="Average Score" value={`${performanceStats.averageScore}%`} progress={performanceStats.averageScore} color="bg-indigo-600" />
              <PerformanceMetric label="Completion Rate" value={`${performanceStats.completionRate}%`} progress={performanceStats.completionRate} color="bg-emerald-600" />
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Top Performing Quiz</p>
                <p className="font-medium">{performanceStats.topPerformingQuiz}</p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/80 backdrop-blur rounded-3xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Recent Quizzes</h2>
              {recentQuizzes.map((quiz, idx) => (
                <QuizCard key={quiz.id || idx} quiz={quiz} />
              ))}
            </div>

            <div className="bg-white/80 backdrop-blur rounded-3xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Notifications</h2>
              {notifications.length > 0 ? (
                notifications.map((n) => <NotificationItem key={n.id} notification={n} />)
              ) : (
                <p className="text-sm text-slate-600">You're all caught up.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
