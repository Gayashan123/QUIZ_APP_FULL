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

/* ---------------- Helpers ---------------- */
const normalizeBase = (base) =>
  typeof base === "string" ? base.replace(/\/+$/, "") + "/" : "/";
const API_ROOT = normalizeBase(apiurl);

const resolveToken = () => {
  try {
    const t = typeof tokenFromLS === "function" ? tokenFromLS() : tokenFromLS;
    if (typeof t === "string") return t;
    if (t && typeof t === "object" && typeof t.token === "string") return t.token;
  } catch (error) {
    console.error("Error resolving token:", error);
  }
  try {
    const ls = localStorage.getItem("authToken");
    return typeof ls === "string" ? ls : "";
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return "";
  }
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
  try {
    const res = await fetch(url, { ...opts, headers: makeHeaders() });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `HTTP ${res.status}`);
    }
    return res.status === 204 ? null : res.json();
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
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

/* ---------------- UI Sections ---------------- */
const DashboardStats = ({ totalQuizzes, upcomingQuizzes, totalStudents, loading }) => (
  <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <StatCard
      title="Total Quizzes"
      value={loading ? "-" : totalQuizzes}
      change={loading ? "…" : ""}
      icon="clipboard"
    />
    <StatCard
      title="Active Students"
      value={loading ? "-" : totalStudents}
      change=""
      icon="students"
    />
    <StatCard
      title="Upcoming Quizzes"
      value={loading ? "-" : upcomingQuizzes}
      change=""
      icon="calendar"
    />
  </section>
);

const QuickActionsPanel = () => (
  <div className="lg:col-span-2 bg-white/80 backdrop-blur rounded-3xl shadow-sm border border-slate-200 p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">Quick Actions</h2>
      <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
        View all
      </button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <ActionButton type="createQuiz" />
      <ActionButton type="viewAnalytics" />
      <ActionButton type="manageStudents" />
      <ActionButton type="gradeSubmissions" />
    </div>
  </div>
);

const PerformancePanel = ({ stats, loading }) => (
  <div className="bg-white/80 backdrop-blur rounded-3xl shadow-sm border border-slate-200 p-6">
    <h2 className="text-xl font-semibold mb-6">Class Performance</h2>
    {loading ? (
      <div className="space-y-6">
        <div className="animate-pulse h-4 bg-slate-200 rounded w-3/4" />
        <div className="animate-pulse h-4 bg-slate-200 rounded w-1/2" />
        <div className="pt-4 border-t border-slate-200">
          <div className="animate-pulse h-4 bg-slate-200 rounded w-2/3 mb-2" />
          <div className="animate-pulse h-4 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    ) : (
      <>
        <PerformanceMetric
          label="Average Score"
          value={`${stats.averageScore}%`}
          progress={stats.averageScore}
          color="bg-indigo-600"
        />
        <PerformanceMetric
          label="Completion Rate"
          value={`${stats.completionRate}%`}
          progress={stats.completionRate}
          color="bg-emerald-600"
        />
        <div className="pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Top Performing Quiz</p>
          <p className="font-medium">{stats.topPerformingQuiz}</p>
        </div>
      </>
    )}
  </div>
);

const RecentQuizzesPanel = ({ quizzes, loading }) => (
  <div className="lg:col-span-2 bg-white/80 backdrop-blur rounded-3xl shadow-sm border border-slate-200 p-6">
    <h2 className="text-xl font-semibold mb-6">Recent Quizzes</h2>
    {loading ? (
      Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse h-12 bg-slate-200 rounded mb-4" />
      ))
    ) : quizzes.length > 0 ? (
      quizzes.map((quiz, idx) => <QuizCard key={quiz.id || idx} quiz={quiz} />)
    ) : (
      <p className="text-sm text-slate-600">No quizzes found.</p>
    )}
  </div>
);

const NotificationsPanel = ({ notifications, loading }) => (
  <div className="bg-white/80 backdrop-blur rounded-3xl shadow-sm border border-slate-200 p-6">
    <h2 className="text-xl font-semibold mb-6">Notifications</h2>
    {loading ? (
      Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse h-12 bg-slate-200 rounded mb-4" />
      ))
    ) : notifications.length > 0 ? (
      notifications.map((n) => <NotificationItem key={n.id} notification={n} />)
    ) : (
      <p className="text-sm text-slate-600">You're all caught up.</p>
    )}
  </div>
);

/* ---------------- Main Component ---------------- */
export default function TeacherHome() {
  const { user, login } = useContext(AuthContext);

  // Greeting name
  const [teacherName, setTeacherName] = useState(user?.name || "Teacher");

  // Data state
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Derived
  const initials = useMemo(() => {
    const parts = (teacherName || "").split(" ").filter(Boolean);
    return parts.length ? parts.map((p) => p[0]?.toUpperCase()).slice(0, 2).join("") : "T";
  }, [teacherName]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  }, []);

  const totalQuizzes = useMemo(() => quizzes.length, [quizzes]);

  const upcomingQuizzes = useMemo(() => {
    const now = new Date();
    return quizzes.filter((q) => statusOf(q, now) === "upcoming").length;
  }, [quizzes]);

  const performanceStats = useMemo(() => {
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
      ? Math.round(
          completionRates.reduce((a, b) => a + b, 0) / completionRates.length
        )
      : 0;

    const topQuiz =
      [...quizzes]
        .filter((q) => Number.isFinite(Number(q.average_score)))
        .sort((a, b) => Number(b.average_score) - Number(a.average_score))[0] ||
      null;

    return {
      averageScore,
      completionRate,
      topPerformingQuiz:
        topQuiz?.name || topQuiz?.quiz_title || topQuiz?.title || "N/A",
    };
  }, [quizzes]);

  const recentQuizzes = useMemo(() => {
    const sorted = [...quizzes].sort((a, b) => {
      const A =
        parseDate(a.created_at || a.createdAt || a.start_time || a.start_at)?.getTime() ||
        0;
      const B =
        parseDate(b.created_at || b.createdAt || b.start_time || b.start_at)?.getTime() ||
        0;
      return B - A;
    });
    return sorted.slice(0, 5);
  }, [quizzes]);

  /* -------- Load teacher info -------- */
  useEffect(() => {
    const loadTeacherInfo = async () => {
      // 1) From localStorage (fast path)
      try {
        const userInfoStr = localStorage.getItem("userInfo");
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          const nameLS =
            userInfo?.name ||
            userInfo?.user?.name ||
            [userInfo?.first_name, userInfo?.last_name]
              .filter(Boolean)
              .join(" ");
          if (nameLS?.trim()) {
            setTeacherName(nameLS.trim());
            return;
          }
        }
      } catch {
        // ignore and continue to API
      }

      // 2) From /checkauth
      try {
        const tk = resolveToken();
        if (!tk) return;
        const data = await fetchJSON(`${API_ROOT}checkauth`);
        const nameFromApi =
          data?.teacher?.name || data?.data?.name || data?.user?.name || data?.name || null;
        if (nameFromApi) {
          setTeacherName(nameFromApi);
          const updatedUser = { ...(user || {}), name: nameFromApi };
          // login expects an object; not a function
          login(updatedUser);
          localStorage.setItem("userInfo", JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error("Error loading teacher info:", error);
      }
    };
    loadTeacherInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  /* -------- Load quizzes -------- */
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingQuizzes(true);
      try {
        const token = resolveToken();
        if (!token) return;

        const data = await fetchJSON(`${API_ROOT}quizzes`);
        if (!mounted) return;

        const list = Array.isArray(data) ? data : data?.data || [];
        setQuizzes(list);
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

  /* -------- Load notifications (placeholder) -------- */
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingNotifications(true);
      try {
        const mockNotifications = [
          { id: 1, message: "Quiz 'Math Test' has been graded", time: "2 hours ago" },
          { id: 2, message: "New student registered for your class", time: "1 day ago" },
          { id: 3, message: "Reminder: Physics quiz starts tomorrow", time: "2 days ago" },
        ];
        if (mounted) setNotifications(mockNotifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        if (mounted) setLoadingNotifications(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  /* -------- Load students (placeholder) -------- */
  useEffect(() => {
    // Replace with real API call
    setTotalStudents(42);
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
            <p className="text-slate-600 mt-1">
              Here's what's happening with your quizzes today.
            </p>
          </section>

          <DashboardStats
            totalQuizzes={totalQuizzes}
            upcomingQuizzes={upcomingQuizzes}
            totalStudents={totalStudents}
            loading={loadingQuizzes}
          />

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <QuickActionsPanel />
            <PerformancePanel stats={performanceStats} loading={loadingQuizzes} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentQuizzesPanel quizzes={recentQuizzes} loading={loadingQuizzes} />
            <NotificationsPanel
              notifications={notifications}
              loading={loadingNotifications}
            />
          </section>
        </div>
      </main>
    </div>
  );
}