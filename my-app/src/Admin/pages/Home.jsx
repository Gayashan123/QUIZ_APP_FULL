import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { FiHome, FiBook, FiUsers, FiBriefcase, FiLayers } from "react-icons/fi";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaClipboardList,
  FaUniversity,
  FaBook,
  FaCalendarAlt,
  FaHistory,
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import AdminStatCard from "../components/StatCard";
import AdminActionButton from "../components/ActionButton";
import { apiurl, token as tokenFromLS } from "../../Admin/common/Http";
import AddStudentForm from "../components/AddStudent";
import AddTeacherForm from "../components/AddTeacher";
import AddSubjectForm from "../components/AddSubject";
import AddFacultyForm from "../components/AddFaculty";
/* ---------- Helpers ---------- */
const normalizeBase = (base) =>
  typeof base === "string" ? base.replace(/\/+$/, "") + "/" : "/";

const API_ROOT = normalizeBase(apiurl);

const resolveToken = () => {
  try {
    const t = typeof tokenFromLS === "function" ? tokenFromLS() : tokenFromLS;
    if (typeof t === "string") return t;
    if (t && typeof t === "object" && typeof t.token === "string")
      return t.token;
  } catch {}
  try {
    const ls = localStorage.getItem("authToken");
    return typeof ls === "string" ? ls : "";
  } catch {
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

const fetchJSON = async (path, opts = {}) => {
  const url = path.startsWith("http")
    ? path
    : API_ROOT + path.replace(/^\/+/, "");
  const res = await fetch(url, { ...opts, headers: makeHeaders() });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      msg = err?.message || err?.error || JSON.stringify(err);
    } catch {}
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
};

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
      parseDate(
        a.created_at || a.createdAt || a.start_time || a.start_at
      )?.getTime() || 0;
    const B =
      parseDate(
        b.created_at || b.createdAt || b.start_time || b.start_at
      )?.getTime() || 0;
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

/* ---------- Component ---------- */
export default function AdminDashboard() {
  const navigate = useNavigate(); // ✅ Initialize useNavigate

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
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

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const token = resolveToken();
      if (!token) throw new Error("Not authenticated");

      const [
        studentsCountRes,
        facultiesRes,
        teachersRes,
        subjectsRes,
        quizzesRes,
      ] = await Promise.all([
        fetchJSON("students/count").catch(() => fetchJSON("students")),
        fetchJSON("faculties"),
        fetchJSON("teachers"),
        fetchJSON("subjects"),
        fetchJSON("quizzes"),
      ]);

      const students =
        typeof studentsCountRes?.count === "number"
          ? studentsCountRes.count
          : typeof studentsCountRes?.total === "number"
          ? studentsCountRes.total
          : listLength(studentsCountRes);

      const faculties = listLength(facultiesRes);
      const teachers = listLength(teachersRes);
      const subjects = listLength(subjectsRes);

      const quizzesList = Array.isArray(quizzesRes)
        ? quizzesRes
        : quizzesRes?.data || [];
      const quizzes = quizzesList.length;

      const now = new Date();
      const ongoing = quizzesList.filter(
        (q) => quizStatus(q, now) === "ongoing"
      ).length;
      const upcoming = quizzesList.filter(
        (q) => quizStatus(q, now) === "upcoming"
      ).length;

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
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const skeleton = (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-slate-200/70 rounded-2xl animate-pulse"
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex">
      <Sidebar
        adminName="Admin"
        links={[
          {
            key: "dashboard",
            label: "Dashboard",
            to: "/admin",
            icon: <FiHome />,
            end: true,
          },
          {
            key: "students",
            label: "Student Management",
            to: "/createst",
            icon: <FiBook />,
          },
          {
            key: "teachers",
            label: "Teacher Management",
            to: "/createte",
            icon: <FiUsers />,
          },
          {
            key: "faculty",
            label: "Faculty Management",
            to: "/createfu",
            icon: <FiBriefcase />,
          },
          {
            key: "subjects",
            label: "Subject Management",
            to: "/createsu",
            icon: <FiLayers />,
          },
        ]}
      />

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
                  onClick={load}
                  disabled={loading}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition disabled:opacity-60"
                  title="Refresh"
                >
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
              </div>
            </div>
            {err && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">
                {err}
              </div>
            )}
          </section>

          {/* Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
            <AdminStatCard
              title="Students"
              value={loading ? "…" : counts.students}
              icon={<FaUsers />}
              color="bg-blue-600"
            />
            <AdminStatCard
              title="Teachers"
              value={loading ? "…" : counts.teachers}
              icon={<FaChalkboardTeacher />}
              color="bg-purple-600"
            />
            <AdminStatCard
              title="Faculties"
              value={loading ? "…" : counts.faculties}
              icon={<FaUniversity />}
              color="bg-emerald-600"
            />
            <AdminStatCard
              title="Subjects"
              value={loading ? "…" : counts.subjects}
              icon={<FaBook />}
              color="bg-amber-600"
            />
            <AdminStatCard
              title="Quizzes"
              value={loading ? "…" : counts.quizzes}
              icon={<FaClipboardList />}
              color="bg-sky-600"
            />
            <AdminStatCard
              title="Ongoing"
              value={loading ? "…" : counts.ongoing}
              icon={<FaHistory />}
              color="bg-green-600"
            />
            <AdminStatCard
              title="Upcoming"
              value={loading ? "…" : counts.upcoming}
              icon={<FaCalendarAlt />}
              color="bg-indigo-600"
            />
          </section>

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
                <p className="text-sm text-gray-600">No quizzes found.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentQuizzes.map((q) => {
                    const title = q?.quiz_title || `Quiz #${q?.id}`;
                    const subj = q?.subject?.name || "—";
                    const st = quizStatus(q);

                    return (
                      <div
                        key={q.id}
                        className="py-3 flex items-start justify-between gap-3 cursor-pointer hover:bg-gray-50 rounded-lg"
                        onClick={() => navigate(`/admin/quiz/${q.id}`)} // ✅ Navigate to quiz details
                      >
                        <div>
                          <div className="font-medium">{title}</div>
                          <div className="text-xs text-gray-500">
                            Subject: {subj} • Start: {fmtDate(q.start_time)} •
                            End: {fmtDate(q.end_time)}
                          </div>
                        </div>
                        <span
                          className={[
                            "text-xs px-2 py-1 rounded-full border",
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
                <button
                  onClick={() => navigate("/createst")}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                  <FiBook /> Create Student
                </button>

                <button
                  onClick={() => navigate("/createte")}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
                >
                  <FiUsers /> Create Teacher
                </button>

                <button
                  onClick={() => navigate("/createfu")}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
                >
                  <FiBriefcase /> Create Faculty
                </button>

                <button
                  onClick={() => navigate("/createsu")}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition"
                >
                  <FiLayers /> Create Subject
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
