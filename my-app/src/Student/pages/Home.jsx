import React, { useState } from "react";
import {
  FaBookOpen,
  FaClock,
  FaCheckCircle,
  FaChartLine,
  FaBell,
  FaSearch,
  FaEllipsisV,
  FaChevronRight,
  FaTrophy,
  FaQuestionCircle,
  FaBars,
  FaTimes
} from "react-icons/fa";
import Sidebar from "../../Student/component/Sidebar";

const studentData = {
  studentName: "Alex Johnson",
  activeQuizzes: 3,
  completedQuizzes: 12,
  averageScore: 84,
  upcomingQuizzes: [
    { id: 1, title: "Algebra Midterm", subject: "Mathematics", dueDate: "Tomorrow", duration: "45 mins" },
    { id: 2, title: "Chemistry Quiz", subject: "Science", dueDate: "In 3 days", duration: "30 mins" }
  ],
  recentResults: [
    { id: 1, title: "History Final", subject: "History", score: 92, date: "2025-07-10" },
    { id: 2, title: "Literature Test", subject: "English", score: 88, date: "2025-07-05" },
    { id: 3, title: "Physics Quiz", subject: "Science", score: 76, date: "2025-06-28" }
  ],
  leaderboard: [
    { rank: 1, name: "Sarah Miller", score: 95 },
    { rank: 2, name: "Alex Johnson", score: 92 },
    { rank: 3, name: "Michael Chen", score: 90 }
  ]
};

export default function StudentDashboard() {
  const {
    studentName,
    activeQuizzes,
    completedQuizzes,
    averageScore,
    upcomingQuizzes,
    recentResults,
    leaderboard
  } = studentData;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex">

      <Sidebar />
      {/* Mobile Menu Button */}
     

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search quizzes, subjects..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-full hover:bg-gray-100">
                <FaBell className="text-gray-600" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <FaEllipsisV className="text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 md:p-8">
          <section className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {studentName}!</h1>
            <p className="text-gray-600">Ready for your next learning challenge?</p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StudentStatCard 
              title="Active Quizzes" 
              value={activeQuizzes} 
              change="+1 new" 
              icon={<FaBookOpen className="text-indigo-600" />}
              color="bg-indigo-100"
            />
            <StudentStatCard 
              title="Completed" 
              value={completedQuizzes} 
              change="2 this week" 
              icon={<FaCheckCircle className="text-green-600" />}
              color="bg-green-100"
            />
            <StudentStatCard 
              title="Average Score" 
              value={`${averageScore}%`} 
              change="+2% from last month" 
              icon={<FaChartLine className="text-blue-600" />}
              color="bg-blue-100"
            />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold">Upcoming Quizzes</h2>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View all</button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {upcomingQuizzes.length === 0 ? (
                  <p className="text-gray-500">No upcoming quizzes.</p>
                ) : (
                  upcomingQuizzes.map(quiz => <QuizCard key={quiz.id} quiz={quiz} />)
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold">Leaderboard</h2>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">You're #2!</span>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {leaderboard.map(student => (
                  <LeaderboardItem key={student.rank} student={student} isCurrent={student.name === studentName} />
                ))}
                <button className="w-full mt-3 sm:mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center gap-2">
                  View full leaderboard <FaChevronRight size={12} />
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold">Recent Results</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View all results</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentResults.map(result => <ResultCard key={result.id} result={result} />)}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// StudentNavItem Component (should be in a separate file)
function StudentNavItem({ icon, children, active = false }) {
  return (
    <button
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition w-full ${
        active
          ? "bg-indigo-50 text-indigo-700 font-medium"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm md:text-base">{children}</span>
    </button>
  );
}

// StudentStatCard Component (should be in a separate file)
function StudentStatCard({ title, value, change, icon, color }) {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold mb-2">{value}</p>
          <p className="text-xs text-gray-500">{change}</p>
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// QuizCard Component (should be in a separate file)
function QuizCard({ quiz }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition">
      <div>
        <h3 className="font-medium text-sm sm:text-base">{quiz.title}</h3>
        <div className="flex gap-2 sm:gap-4 mt-1">
          <span className="text-xs text-gray-500">{quiz.subject}</span>
          <span className="text-xs text-gray-500">{quiz.duration}</span>
        </div>
      </div>
      <div className="mt-2 sm:mt-0 flex items-center gap-2 sm:gap-4">
        <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full ${
          quiz.dueDate === "Tomorrow" ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {quiz.dueDate}
        </span>
        <button className="text-gray-400 hover:text-indigo-600">
          <FaChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

// LeaderboardItem Component (should be in a separate file)
function LeaderboardItem({ student, isCurrent }) {
  return (
    <div className={`flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg ${
      isCurrent ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'
    }`}>
      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${
        student.rank === 1 ? 'bg-yellow-100 text-yellow-800' : 
        student.rank === 2 ? 'bg-gray-200 text-gray-800' : 
        'bg-amber-100 text-amber-800'
      }`}>
        {student.rank}
      </div>
      <div className="flex-1">
        <p className={`font-medium text-sm sm:text-base ${
          isCurrent ? 'text-indigo-700' : ''
        }`}>{student.name}</p>
      </div>
      <div className="font-bold text-sm sm:text-base">{student.score}%</div>
    </div>
  );
}

// ResultCard Component (should be in a separate file)
function ResultCard({ result }) {
  const scoreColor = result.score >= 90 ? 'text-green-600' : 
                    result.score >= 75 ? 'text-blue-600' : 
                    'text-orange-600';
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <h3 className="font-medium text-sm sm:text-base">{result.title}</h3>
        <span className={`text-base sm:text-lg font-bold ${scoreColor}`}>{result.score}%</span>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{result.subject}</p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{result.date}</span>
        <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
          View details
        </button>
      </div>
    </div>
  );
}