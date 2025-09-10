import React, { useEffect, useState, useContext, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import ActionButton from "../components/ActionButton";
import QuizCard from "../components/QuizCard";
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

/* ---------------- iOS Card Wrapper ---------------- */
const IOSCard = ({ children, className = "" }) => (
  <div
    className={[
      "rounded-3xl bg-white/70 backdrop-blur-xl",
      "border border-black/5",
      "shadow-[0_1px_0_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.06)]",
      "p-6",
      className,
    ].join(" ")}
  >
    {children}
  </div>
);

/* ---------------- UI Sections ---------------- */
const DashboardStats = ({ totalQuizzes, upcomingQuizzes, totalStudents, loading }) => (
  <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
    <IOSCard>
      <StatCard
        title="Total Quizzes"
        value={loading ? "-" : totalQuizzes}
        change=""
        icon="clipboard"
      />
    </IOSCard>
   
    <IOSCard>
      <StatCard
        title="Upcoming Quizzes"
        value={loading ? "-" : upcomingQuizzes}
        change=""
        icon="calendar"
      />
    </IOSCard>
  </section>
);

const QuickActionsPanel = () => (
  <IOSCard className="lg:col-span-2">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
     
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <ActionButton type="createQuiz" />
      
    </div>
  </IOSCard>
);

const RecentQuizzesPanel = ({ quizzes, loading }) => (
  <IOSCard className="lg:col-span-2">
    <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Quizzes</h2>
    {loading ? (
      Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse h-12 bg-slate-200 rounded-xl mb-3" />
      ))
    ) : quizzes.length > 0 ? (
      quizzes.map((quiz, idx) => <QuizCard key={quiz.id || idx} quiz={quiz} />)
    ) : (
      <p className="text-sm text-slate-600">No quizzes found.</p>
    )}
  </IOSCard>
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

  const recentQuizzes = useMemo(() => {
    const sorted = [...quizzes].sort((a, b) => {
      const A = parseDate(a.created_at || a.createdAt || a.start_time || a.start_at)?.getTime() || 0;
      const B = parseDate(b.created_at || b.createdAt || b.start_time || b.start_at)?.getTime() || 0;
      return B - A;
    });
    return sorted.slice(0, 5);
  }, [quizzes]);

  /* -------- Load teacher info -------- */
  useEffect(() => {
    const loadTeacherInfo = async () => {
      try {
        const userInfoStr = localStorage.getItem("userInfo");
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          const nameLS =
            userInfo?.name ||
            userInfo?.user?.name ||
            [userInfo?.first_name, userInfo?.last_name].filter(Boolean).join(" ");
          if (nameLS?.trim()) {
            setTeacherName(nameLS.trim());
            return;
          }
        }
      } catch {}

      try {
        const tk = resolveToken();
        if (!tk) return;
        const data = await fetchJSON(`${API_ROOT}checkauth`);
        const nameFromApi =
          data?.teacher?.name || data?.data?.name || data?.user?.name || data?.name || null;
        if (nameFromApi) {
          setTeacherName(nameFromApi);
          const updatedUser = { ...(user || {}), name: nameFromApi };
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

  /* -------- Load students count -------- */
  useEffect(() => {
    let mounted = true;
    const loadCount = async () => {
      try {
        const token = resolveToken();
        if (!token) return;

        const data = await fetchJSON(`${API_ROOT}students/count`);
        if (!mounted) return;

        const count =
          typeof data?.count === "number"
            ? data.count
            : typeof data?.data?.count === "number"
            ? data.data.count
            : 0;

        setTotalStudents(count);
      } catch (err) {
        console.error("Error fetching students count:", err);
      }
    };
    loadCount();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 flex font-sans">
      {/* Optional soft spotlight background for depth */}
      <div className="pointer-events-none fixed inset-0 opacity-70" aria-hidden="true">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white blur-3xl" />
      </div>

      <Sidebar teacherName={teacherName} initials={initials} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <section className="mb-6">
            {/* iOS Large Title */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              {greeting}, {teacherName}
            </h1>
            <p className="text-slate-600 mt-1">Here’s what’s happening with your class.</p>
          </section>

          <DashboardStats
            totalQuizzes={totalQuizzes}
            upcomingQuizzes={upcomingQuizzes}
            totalStudents={totalStudents}
            loading={loadingQuizzes}
          />

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            <QuickActionsPanel />
            <RecentQuizzesPanel quizzes={recentQuizzes} loading={loadingQuizzes} />
          </section>
        </div>
      </main>
    </div>
  );
}
