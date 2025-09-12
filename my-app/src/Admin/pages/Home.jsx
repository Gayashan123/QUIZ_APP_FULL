import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiBook,
  FiUsers,
  FiBriefcase,
  FiLayers,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaClipboardList,
  FaUniversity,
  FaBook,
  FaCalendarAlt,
  FaHistory,
  FaExclamationTriangle,
} from "react-icons/fa";

// Import API configuration
import api from "../common/api";

// Lazy load components
const Sidebar = lazy(() => import("../components/Sidebar"));
const AdminStatCard = lazy(() => import("../components/StatCard"));
const AddStudentForm = lazy(() => import("../components/AddStudent"));
const AddTeacherForm = lazy(() => import("../components/AddTeacher"));
const AddSubjectForm = lazy(() => import("../components/AddSubject"));
const AddFacultyForm = lazy(() => import("../components/AddFaculty"));

// Helper functions
const parseDate = (v) => (v ? new Date(v) : null);

const quizStatus = (q, now = new Date()) => {
  const s = parseDate(q?.start_time || q?.start_at);
  const e = parseDate(q?.end_time || q?.end_at);
  if (s && now < s) return "upcoming";
  if (s && e && now >= s && now <= e) return "ongoing";
  if (e && now > e) return "past";
  return "unknown";
};

const listLength = (data) => {
  if (Array.isArray(data)) return data.length;
  if (Array.isArray(data?.data)) return data.data.length;
  if (typeof data?.total === "number") return data.total;
  if (typeof data?.count === "number") return data.count;
  return 0;
};

const safeRecent = (arr, n = 6) => {
  const sorted = [...arr].sort((a, b) => {
    const A =
      parseDate(a.created_at || a.createdAt || a.start_time || a.start_at)?.getTime() || 0;
    const B =
      parseDate(b.created_at || b.createdAt || b.start_time || b.start_at)?.getTime() || 0;
    return B - A;
  });
  return sorted.slice(0, n);
};

const fmtDate = (d) => {
  const dt = parseDate(d);
  if (!dt) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dt);
  } catch {
    return String(d);
  }
};

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Error boundary component
const ErrorBoundary = ({ children, message }) => {
  if (message) {
    return (
      <div className="rounded-lg bg-red-50 p-4 mb-4">
        <div className="flex items-center">
          <FaExclamationTriangle className="text-red-400 mr-2" />
          <span className="text-red-700 text-sm">{message}</span>
        </div>
      </div>
    );
  }
  return children;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({
    faculties: 0,
    students: 0,
    teachers: 0,
    subjects: 0,
    quizzes: 0,
    ongoing: 0,
    upcoming: 0,
  });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [activeForm, setActiveForm] = useState(null);
  const [formError, setFormError] = useState("");

 // Inside loadData function
const loadData = useCallback(async () => {
  setLoading(true);
  setError("");

  try {
    const [
      studentsResponse,
      facultiesResponse,
      teachersResponse,
      subjectsResponse,
      quizzesResponse,
    ] = await Promise.all([
      api.get("students"),   // Get all students
      api.get("faculties"),  // Get all faculties
      api.get("teachers"),   // Get all teachers
      api.get("subjects"),   // Get all subjects
      api.get("quizzes"),    // Get all quizzes
    ]);

    const students = listLength(studentsResponse.data);
    const faculties = listLength(facultiesResponse.data);
    const teachers = listLength(teachersResponse.data);
    const subjects = listLength(subjectsResponse.data);

    const quizzesList = Array.isArray(quizzesResponse.data)
      ? quizzesResponse.data
      : quizzesResponse.data?.data || [];

    const quizzes = quizzesList.length;
    const now = new Date();

    const ongoing = quizzesList.filter((q) => quizStatus(q, now) === "ongoing").length;
    const upcoming = quizzesList.filter((q) => quizStatus(q, now) === "upcoming").length;

    setCounts({
      faculties,
      students,
      teachers,
      subjects,
      quizzes,
      ongoing,
      upcoming,
    });

    setRecentQuizzes(safeRecent(quizzesList, 6));
  } catch (err) {
 
    setError(err.response?.data?.message || err.message || "Failed to load data");
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFormOpen = useCallback((formName) => {
    setActiveForm(formName);
    setFormError("");
  }, []);

  const handleFormClose = useCallback(() => {
    setActiveForm(null);
    setFormError("");
    // Refresh data when a form is closed (assuming something might have been added)
    loadData();
  }, [loadData]);

  const handleQuizClick = useCallback((quizId) => {
    navigate(`/admin/quiz/${quizId}`);
  }, [navigate]);

  // Memoize the stats cards to prevent unnecessary re-renders
  const statsCards = useMemo(() => [
    {
      title: "Students",
      value: loading ? "…" : counts.students,
      icon: <FaUsers />,
      color: "bg-blue-600"
    },
    {
      title: "Teachers",
      value: loading ? "…" : counts.teachers,
      icon: <FaChalkboardTeacher />,
      color: "bg-purple-600"
    },
    {
      title: "Faculties",
      value: loading ? "…" : counts.faculties,
      icon: <FaUniversity />,
      color: "bg-emerald-600"
    },
    {
      title: "Subjects",
      value: loading ? "…" : counts.subjects,
      icon: <FaBook />,
      color: "bg-amber-600"
    },
    {
      title: "Quizzes",
      value: loading ? "…" : counts.quizzes,
      icon: <FaClipboardList />,
      color: "bg-sky-600"
    },
    {
      title: "Ongoing",
      value: loading ? "…" : counts.ongoing,
      icon: <FaHistory />,
      color: "bg-green-600"
    },
    {
      title: "Upcoming",
      value: loading ? "…" : counts.upcoming,
      icon: <FaCalendarAlt />,
      color: "bg-indigo-600"
    }
  ], [loading, counts]);

  const quickActions = useMemo(() => [
    {
      label: "Create Student",
      icon: <FiBook />,
      color: "bg-blue-600 hover:bg-blue-700",
      action: () => handleFormOpen("student")
    },
    {
      label: "Create Teacher",
      icon: <FiUsers />,
      color: "bg-purple-600 hover:bg-purple-700",
      action: () => handleFormOpen("teacher")
    },
    {
      label: "Create Faculty",
      icon: <FiBriefcase />,
      color: "bg-emerald-600 hover:bg-emerald-700",
      action: () => handleFormOpen("faculty")
    },
    {
      label: "Create Subject",
      icon: <FiLayers />,
      color: "bg-amber-600 hover:bg-amber-700",
      action: () => handleFormOpen("subject")
    }
  ], [handleFormOpen]);

  const skeleton = useMemo(
    () => (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-slate-200/70 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    ),
    []
  );

  const renderForm = () => {
    if (!activeForm) return null;
    
    const formProps = {
      onCancel: handleFormClose,
      onSuccess: handleFormClose,
      error: formError,
      setError: setFormError
    };
    
    return (
      <ErrorBoundary message={formError}>
        <Suspense fallback={<LoadingSpinner />}>
          {activeForm === "student" && <AddStudentForm {...formProps} />}
          {activeForm === "teacher" && <AddTeacherForm {...formProps} />}
          {activeForm === "faculty" && <AddFacultyForm {...formProps} />}
          {activeForm === "subject" && <AddSubjectForm {...formProps} />}
        </Suspense>
      </ErrorBoundary>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex">
      <Suspense fallback={<div className="p-6">Loading sidebar...</div>}>
        <Sidebar
          adminName="Admin"
          links={[
            { key: "dashboard", label: "Dashboard", to: "/admin", icon: <FiHome />, end: true },
            { key: "students", label: "Student Management", to: "/createst", icon: <FiBook /> },
            { key: "teachers", label: "Teacher Management", to: "/createte", icon: <FiUsers /> },
            { key: "faculty", label: "Faculty Management", to: "/createfu", icon: <FiBriefcase /> },
            { key: "subjects", label: "Subject Management", to: "/createsu", icon: <FiLayers /> },
          ]}
        />
      </Suspense>

      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <section className="mb-8">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  System Overview
                </h1>
                <p className="text-gray-600">
                  Real-time snapshot of your platform metrics.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition disabled:opacity-60"
                  title="Refresh"
                >
                  <FiRefreshCw className={loading ? "animate-spin" : ""} />
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
              </div>
            </div>
            {error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm flex items-center gap-2">
                <FaExclamationTriangle />
                {error}
              </div>
            )}
          </section>

          {/* Stats */}
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
            ))}
          </div>}>
            <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
              {statsCards.map((card, index) => (
                <AdminStatCard
                  key={index}
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  color={card.color}
                />
              ))}
            </section>
          </Suspense>

          {/* Quizzes Overview + Quick Actions */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Quizzes Overview */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Quizzes</h2>
                {!loading && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {counts.quizzes} total
                  </span>
                )}
              </div>

              {loading ? (
                skeleton
              ) : !recentQuizzes.length ? (
                <div className="text-center py-8 text-gray-500">
                  <FaClipboardList className="mx-auto text-3xl mb-2 text-gray-300" />
                  <p>No quizzes found.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentQuizzes.map((q) => {
                    const title = q?.quiz_title || `Quiz #${q?.id}`;
                    const subj = q?.subject?.name || "—";
                    const st = quizStatus(q);

                    return (
                      <div
                        key={q.id}
                        className="py-3 flex items-start justify-between gap-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => handleQuizClick(q.id)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleQuizClick(q.id);
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="block">Subject: {subj}</span>
                            <span className="block">Start: {fmtDate(q.start_time)}</span>
                            <span className="block">End: {fmtDate(q.end_time)}</span>
                          </div>
                        </div>
                        <span
                          className={[
                            "text-xs px-2 py-1 rounded-full border whitespace-nowrap",
                            st === "ongoing"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : st === "upcoming"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : st === "past"
                              ? "bg-gray-50 text-gray-700 border-gray-200"
                              : "bg-amber-50 text-amber-800 border-amber-200",
                          ].join(" ")}
                        >
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`w-full flex items-center gap-2 px-4 py-2 ${action.color} text-white rounded-xl transition`}
                  >
                    {action.icon} {action.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      
      {/* Modal for forms */}
      {activeForm && (
        <div className="fixed inset-0 bg-transparent  flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                {activeForm === "student" && "Add Student"}
                {activeForm === "teacher" && "Add Teacher"}
                {activeForm === "faculty" && "Add Faculty"}
                {activeForm === "subject" && "Add Subject"}
              </h3>
              <button
                onClick={handleFormClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4">
              {renderForm()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}