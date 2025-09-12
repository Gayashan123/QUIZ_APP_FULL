import React, { useEffect, useState, useContext, useMemo, lazy, Suspense } from "react";
import { AuthContext } from "../../context/Auth";
import api from "../../Admin/common/api";

// Lazy load components
const Sidebar = lazy(() => import("../components/Sidebar"));
const StatCard = lazy(() => import("../components/StatCard"));
const ActionButton = lazy(() => import("../components/ActionButton"));
const QuizCard = lazy(() => import("../components/QuizCard"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Error display component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="rounded-xl bg-red-50 p-4 mb-4">
    <div className="text-red-700 text-sm">{message}</div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
      >
        Try Again
      </button>
    )}
  </div>
);

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
      <Suspense fallback={<div className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>}>
        <StatCard
          title="Total Quizzes"
          value={loading ? "-" : totalQuizzes}
          change=""
          icon="clipboard"
        />
      </Suspense>
    </IOSCard>
   
    <IOSCard>
      <Suspense fallback={<div className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>}>
        <StatCard
          title="Upcoming Quizzes"
          value={loading ? "-" : upcomingQuizzes}
          change=""
          icon="calendar"
        />
      </Suspense>
    </IOSCard>
    
    <IOSCard>
      <Suspense fallback={<div className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>}>
        <StatCard
          title="Total Students"
          value={loading ? "-" : totalStudents}
          change=""
          icon="users"
        />
      </Suspense>
    </IOSCard>
  </section>
);

const QuickActionsPanel = () => (
  <IOSCard className="lg:col-span-2">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Suspense fallback={<div className="h-12 bg-gray-200 animate-pulse rounded-md"></div>}>
        <ActionButton type="createQuiz" />
      </Suspense>
    </div>
  </IOSCard>
);

const RecentQuizzesPanel = ({ quizzes, loading, error, onRetry }) => (
  <IOSCard className="lg:col-span-2">
    <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Quizzes</h2>
    {error ? (
      <ErrorMessage message={error} onRetry={onRetry} />
    ) : loading ? (
      Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse h-12 bg-slate-200 rounded-xl mb-3" />
      ))
    ) : quizzes.length > 0 ? (
      <Suspense fallback={<div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse h-16 bg-slate-200 rounded-xl" />
        ))}
      </div>}>
        {quizzes.map((quiz, idx) => <QuizCard key={quiz.id || idx} quiz={quiz} />)}
      </Suspense>
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
  const [quizError, setQuizError] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentError, setStudentError] = useState(null);

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
    return quizzes.filter((q) => {
      const startTime = q?.start_time || q?.start_at;
      const endTime = q?.end_time || q?.end_at;
      if (!startTime) return false;
      
      const startDate = new Date(startTime);
      const endDate = endTime ? new Date(endTime) : null;
      
      if (now < startDate) return true; // Upcoming
      if (endDate && now <= endDate) return false; // Ongoing
      return false; // Past
    }).length;
  }, [quizzes]);

  const recentQuizzes = useMemo(() => {
    const sorted = [...quizzes].sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || a.start_time || a.start_at || 0);
      const dateB = new Date(b.created_at || b.createdAt || b.start_time || b.start_at || 0);
      return dateB - dateA;
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
      } catch (error) {
        // Silently handle error for user info parsing
      }

      try {
        const response = await api.get("checkauth");
        const data = response.data;
        const nameFromApi =
          data?.teacher?.name || data?.data?.name || data?.user?.name || data?.name || null;
        if (nameFromApi) {
          setTeacherName(nameFromApi);
          const updatedUser = { ...(user || {}), name: nameFromApi };
          login(updatedUser);
          localStorage.setItem("userInfo", JSON.stringify(updatedUser));
        }
      } catch (error) {
        // Silently handle error for auth check
      }
    };
    loadTeacherInfo();
  }, [user, login]);

  /* -------- Load quizzes -------- */
  const loadQuizzes = async () => {
    setLoadingQuizzes(true);
    setQuizError(null);
    try {
      const response = await api.get("quizzes");
      const data = response.data;
      const list = Array.isArray(data) ? data : data?.data || [];
      setQuizzes(list);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load quizzes";
      setQuizError(errorMessage);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  /* -------- Load students count -------- */
  const loadStudentsCount = async () => {
  setLoadingStudents(true);
  setStudentError(null);
  try {
    const response = await api.get("students"); // fetch all students
    const studentsArray = response.data.data || []; // get the array
    setTotalStudents(studentsArray.length); // array length = total students
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || err.message || "Failed to load student count";
    setStudentError(errorMessage);
  } finally {
    setLoadingStudents(false);
  }
};


  useEffect(() => {
    loadStudentsCount();
  }, []);

  const loading = loadingQuizzes || loadingStudents;

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 flex font-sans">
      {/* Optional soft spotlight background for depth */}
      <div className="pointer-events-none fixed inset-0 opacity-70" aria-hidden="true">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white blur-3xl" />
      </div>

      <Suspense fallback={<div className="w-64 bg-gray-800"></div>}>
        <Sidebar teacherName={teacherName} initials={initials} />
      </Suspense>
      
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <section className="mb-6">
            {/* iOS Large Title */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              {greeting}, {teacherName}
            </h1>
            <p className="text-slate-600 mt-1">Here's what's happening with your class.</p>
          </section>

          {studentError && (
            <ErrorMessage message={studentError} onRetry={loadStudentsCount} />
          )}

          <DashboardStats
            totalQuizzes={totalQuizzes}
            upcomingQuizzes={upcomingQuizzes}
            totalStudents={totalStudents}
            loading={loading}
          />

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            <QuickActionsPanel />
            <RecentQuizzesPanel 
              quizzes={recentQuizzes} 
              loading={loadingQuizzes} 
              error={quizError}
              onRetry={loadQuizzes}
            />
          </section>
        </div>
      </main>
    </div>
  );
}