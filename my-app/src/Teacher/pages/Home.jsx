import React from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import StatCard from "../components/StatCard";
import ActionButton from "../components/ActionButton";
import PerformanceMetric from "../components/PerformanceMetric";
import QuizCard from "../components/QuizCard";
import NotificationItem from "../components/NotificationItem";

const dummyData = {
  teacherName: "Mr. Smith",
  totalQuizzes: 8,
  totalStudents: 120,
  upcomingQuizzes: 2,
  recentQuizzes: [
    { id: 1, title: "Math Quiz 1", date: "2025-07-20", subject: "Mathematics", submissions: 45 },
    { id: 2, title: "Science Quiz 1", date: "2025-07-18", subject: "Science", submissions: 38 },
    { id: 3, title: "History Quiz", date: "2025-07-15", subject: "History", submissions: 52 },
  ],
  performanceStats: {
    averageScore: 78,
    completionRate: 92,
    topPerformingQuiz: "Math Quiz 1"
  },
  notifications: [
    { id: 1, message: "3 new submissions for Math Quiz 1", time: "2h ago" },
    { id: 2, message: "Science Quiz 1 deadline approaching", time: "1d ago" }
  ]
};

export default function TeacherHome() {
  const {
    teacherName,
    totalQuizzes,
    totalStudents,
    upcomingQuizzes,
    recentQuizzes,
    performanceStats,
    notifications
  } = dummyData;


  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex">
      <Sidebar teacherName={teacherName} />

      <main className="flex-1 overflow-auto">
        <TopNav notifications={notifications} />

        <div className="p-6 md:p-8">
          {/* Welcome Section */}
          <section className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Good morning, {teacherName}</h1>
            <p className="text-gray-600">Here's what's happening with your quizzes today</p>
          </section>

          {/* Stats Overview */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Quizzes" value={totalQuizzes} change="+2 this month" icon="clipboard" />
            <StatCard title="Active Students" value={totalStudents} change="+12 this month" icon="students" />
            <StatCard title="Upcoming Quizzes" value={upcomingQuizzes} change="1 tomorrow" icon="calendar" />
          </section>

          {/* Quick Actions & Performance */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Class Performance</h2>
              <div className="space-y-5">
                <PerformanceMetric label="Average Score" value={`${performanceStats.averageScore}%`} progress={performanceStats.averageScore} color="bg-indigo-600" />
                <PerformanceMetric label="Completion Rate" value={`${performanceStats.completionRate}%`} progress={performanceStats.completionRate} color="bg-green-600" />
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Top Performing Quiz</p>
                  <p className="font-medium">{performanceStats.topPerformingQuiz}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Quizzes & Notifications */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Quizzes</h2>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  View all
                </button>
              </div>

              <div className="space-y-4">
                {recentQuizzes.map(quiz => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  Mark all as read
                </button>
              </div>

              <div className="space-y-4">
                {notifications.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
