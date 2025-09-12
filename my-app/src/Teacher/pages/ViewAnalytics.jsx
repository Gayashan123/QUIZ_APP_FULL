import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LabelList,
} from "recharts";
import { Home, Download, Filter, RefreshCw, Search } from "lucide-react";
import { format, parseISO } from "date-fns";

// Mock data store for quiz names & IDs (in real app, call backend for search)
const MOCK_QUIZZES = [
  { quizId: "123", quizTitle: "React Fundamentals Assessment" },
  { quizId: "456", quizTitle: "JavaScript Basics" },
  { quizId: "789", quizTitle: "Advanced CSS" },
];

// Mock API to fetch analytics by quizId & filter by month/year (monthFilter optional)
const fetchQuizAnalytics = async (quizId, monthFilter) => {
  await new Promise((res) => setTimeout(res, 600));

  // Normally fetch by quizId, filter by monthFilter: simulate here by ignoring monthFilter
  if (!MOCK_QUIZZES.find((q) => q.quizId === quizId)) {
    throw new Error("Quiz not found");
  }

  // Return your same mock data here; optionally, simulate monthly change by monthFilter
  return {
    quizId,
    quizTitle: MOCK_QUIZZES.find((q) => q.quizId === quizId).quizTitle,
    createdAt: "2023-11-15T09:30:00Z",
    lastUpdated: "2023-11-20T14:45:00Z",
    totalParticipants: 245,
    averageScore: 78.5,
    passingRate: 82.3,
    passingThreshold: 65,
    completionRate: 94.2,
    timeSpentAverage: "12:45",
    scoreDistribution: [
      { range: "0-20%", count: 8, percentage: 3.3 },
      { range: "21-40%", count: 15, percentage: 6.1 },
      { range: "41-60%", count: 32, percentage: 13.1 },
      { range: "61-80%", count: 105, percentage: 42.9 },
      { range: "81-100%", count: 85, percentage: 34.7 },
    ],
    questionPerformance: [
      {
        id: "q1",
        question: "What is JSX in React?",
        avgScore: 85.2,
        correctRate: 89.4,
        difficulty: "Medium",
        discriminationIndex: 0.42,
      },
      {
        id: "q2",
        question: "Difference between state and props",
        avgScore: 72.8,
        correctRate: 76.3,
        difficulty: "Easy",
        discriminationIndex: 0.38,
      },
      {
        id: "q3",
        question: "Explain React component lifecycle methods",
        avgScore: 64.5,
        correctRate: 67.8,
        difficulty: "Hard",
        discriminationIndex: 0.51,
      },
      {
        id: "q4",
        question: "How to use useEffect hook properly?",
        avgScore: 79.1,
        correctRate: 82.9,
        difficulty: "Medium",
        discriminationIndex: 0.45,
      },
      {
        id: "q5",
        question: "Purpose of keys in React lists",
        avgScore: 88.3,
        correctRate: 92.1,
        difficulty: "Easy",
        discriminationIndex: 0.35,
      },
    ],
    demographicBreakdown: {
      byExperience: [
        { level: "Beginner", count: 120, avgScore: 65.2 },
        { level: "Intermediate", count: 85, avgScore: 82.7 },
        { level: "Advanced", count: 40, avgScore: 91.3 },
      ],
      byDepartment: [
        { department: "Engineering", count: 150, avgScore: 83.4 },
        { department: "Product", count: 45, avgScore: 72.1 },
        { department: "Design", count: 30, avgScore: 68.9 },
        { department: "Marketing", count: 20, avgScore: 65.3 },
      ],
    },
  };
};

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F97316", "#10B981"];
const DIFFICULTY_COLORS = {
  Easy: "#10B981",
  Medium: "#F59E0B",
  Hard: "#EF4444",
};

export default function TeacherQuizAnalyticsDashboard() {
  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [foundQuiz, setFoundQuiz] = useState(null); // quizId that has data loaded
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(""); // YYYY-MM format filter

  // --- Handlers ---

  const searchQuiz = async () => {
    setSearchError(null);
    setQuizData(null);
    setFoundQuiz(null);

    // Trim and lowercase for search
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      setSearchError("Please enter a Quiz ID or name to search.");
      return;
    }

    // Find matching quiz by ID or name (simulation)
    const quiz = MOCK_QUIZZES.find(
      (q) =>
        q.quizId.toLowerCase() === term ||
        q.quizTitle.toLowerCase().includes(term)
    );

    if (!quiz) {
      setSearchError("No matching quiz found.");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchQuizAnalytics(quiz.quizId, selectedMonth);
      setQuizData(data);
      setFoundQuiz(quiz.quizId);
      setActiveTab("overview");
    } catch (e) {
      setSearchError(e.message || "Failed to fetch quiz analytics.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch new data on month change if quiz is selected
  useEffect(() => {
    if (foundQuiz) {
      setLoading(true);
      fetchQuizAnalytics(foundQuiz, selectedMonth)
        .then(setQuizData)
        .catch((e) => setSearchError(e.message || "Failed to load data"))
        .finally(() => setLoading(false));
    }
  }, [foundQuiz, selectedMonth]);

  // Export quiz data as CSV
  const handleExport = () => {
    if (!quizData) return;

    // Build CSV headers and rows
    let csv = "Quiz Analytics Export\n";
    csv += `Quiz ID:,${quizData.quizId}\nTitle:,${quizData.quizTitle}\nCreated At:,${quizData.createdAt}\nLast Updated:,${quizData.lastUpdated}\n\n`;

    csv += "Metric,Value\n";
    csv += `Total Participants,${quizData.totalParticipants}\n`;
    csv += `Average Score,${quizData.averageScore.toFixed(1)}%\n`;
    csv += `Passing Rate,${quizData.passingRate.toFixed(1)}%\n`;
    csv += `Completion Rate,${quizData.completionRate.toFixed(1)}%\n\n`;

    csv += "Score Distribution Range,Count,Percentage\n";
    quizData.scoreDistribution.forEach((item) => {
      csv += `${item.range},${item.count},${item.percentage}\n`;
    });
    csv += "\n";

    csv +=
      "Question,Avg Score (%),Correct Rate (%),Difficulty,Discrimination Index\n";
    quizData.questionPerformance.forEach((q) => {
      csv += `${q.question},${q.avgScore.toFixed(
        1
      )},${q.correctRate.toFixed(1)},${q.difficulty},${q.discriminationIndex.toFixed(
        2
      )}\n`;
    });

    // Create CSV download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // Use quiz title and selected month for filename
    const filename = `quiz_${quizData.quizId}_analytics${
      selectedMonth ? `_${selectedMonth}` : ""
    }.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Month options (last 12 months)
  const getLast12Months = () => {
    const months = [];
    const curr = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(curr.getFullYear(), curr.getMonth() - i, 1);
      months.push({
        value: format(d, "yyyy-MM"),
        label: format(d, "MMM yyyy"),
      });
    }
    return months;
  };

  // Render Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 mx-auto mb-4 text-indigo-600 animate-spin" />
          <p className="text-gray-600 font-semibold tracking-wide text-lg">
            Loading quiz analytics...
          </p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header & Search */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">
            Teacher Quiz Analytics
          </h1>

          {/* Search form */}
          <div className="flex w-full md:w-auto items-center space-x-2">
            <input
              type="text"
              aria-label="Search quiz by ID or name"
              className="flex-grow md:flex-grow-0 w-full md:w-96 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
              placeholder="Enter Quiz ID or Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchQuiz();
              }}
            />
            <button
              onClick={searchQuiz}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Search quiz"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Error / No quiz selected message */}
      {!foundQuiz && !loading && (
        <div className="max-w-4xl mx-auto p-6 mt-12 text-center text-gray-600">
          {searchError ? (
            <p className="text-red-600 font-semibold">{searchError}</p>
          ) : (
            <p>
              Please search a quiz by <b>ID</b> or <b>name</b> to see its
              analytics.
            </p>
          )}
        </div>
      )}

      {/* Quiz analytics */}
      {quizData && (
        <>
          {/* Quiz Summary Header */}
          <section className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 truncate max-w-lg">
                  {quizData.quizTitle}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5 whitespace-nowrap">
                  <span>Quiz ID: {quizData.quizId}</span>{" "}
                  <span className="mx-2">&middot;</span>
                  <span>
                    Created: {format(parseISO(quizData.createdAt), "MMM d, yyyy")}
                  </span>{" "}
                  <span className="mx-2">&middot;</span>
                  <span>
                    Last updated:{" "}
                    {format(parseISO(quizData.lastUpdated), "MMM d, yyyy")}
                  </span>
                </p>
              </div>

              {/* Month Selector & Export & Home */}
              <div className="flex flex-wrap items-center gap-3">
                <Filter className="w-5 h-5 text-indigo-600" />
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Filter analytics by month and year"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="">All Time</option>
                  {getLast12Months().map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleExport}
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Export quiz analytics data"
                >
                  <Download className="w-5 h-5" /> Export
                </button>
              </div>
            </div>
          </section>

          {/* Tabs Navigation */}
          <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-8">
                {["overview", "questions", "demographics", "comparison"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-1 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                        activeTab === tab
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                      role="tab"
                      aria-selected={activeTab === tab}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                {/* Metrics */}
                <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <MetricCard
                    title="Total Participants"
                    value={quizData.totalParticipants}
                    icon="👥"
                  />
                  <MetricCard
                    title="Average Score"
                    value={`${quizData.averageScore.toFixed(1)}%`}
                    icon="📊"
                  />
                  <MetricCard
                    title="Passing Rate"
                    value={`${quizData.passingRate.toFixed(1)}%`}
                    icon="✅"
                    threshold={quizData.passingThreshold}
                  />
                  <MetricCard
                    title="Completion Rate"
                    value={`${quizData.completionRate.toFixed(1)}%`}
                    icon="🏁"
                  />
                </section>

                {/* Score Distribution Bar Chart */}
                <section className="bg-white shadow rounded-lg p-6 mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Score Distribution
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Passing Threshold:</span>
                      <span className="text-sm font-medium bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                        {quizData.passingThreshold}%
                      </span>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={quizData.scoreDistribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="range" tick={{ fill: "#6B7280" }} axisLine={false} />
                        <YAxis tick={{ fill: "#6B7280" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(value) => [`${value} participants`, "Count"]}
                          labelFormatter={(label) => `Score Range: ${label}`}
                          contentStyle={{
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            border: "none",
                          }}
                        />
                        <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]}>
                          <LabelList
                            dataKey="percentage"
                            position="top"
                            formatter={(value) => `${value}%`}
                            fill="#6B7280"
                            fontSize={12}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Question Performance Pie Chart */}
                <section className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Question Performance Overview
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={quizData.questionPerformance}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          paddingAngle={2}
                          dataKey="avgScore"
                          nameKey="question"
                          label={({ name, percent }) =>
                            `${name.split(" ")[0]}... (${(percent * 100).toFixed(0)}%)`
                          }
                          labelLine={false}
                        >
                          {quizData.questionPerformance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${value.toFixed(1)}%`,
                            props.payload.question,
                          ]}
                        />
                        <Legend
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                          formatter={(value, entry, index) =>
                            quizData.questionPerformance[index].question
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </>
            )}

            {/* Questions Tab */}
            {activeTab === "questions" && (
              <section className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Detailed Question Analysis
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Question
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Correct Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Difficulty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Discrimination
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Analysis
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quizData.questionPerformance.map((q, idx) => (
                        <tr key={q.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-6 py-4 whitespace-normal max-w-xs text-sm font-medium text-gray-900">
                            {q.question}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                <div
                                  className="bg-indigo-600 h-2.5 rounded-full"
                                  style={{ width: `${q.avgScore}%` }}
                                ></div>
                              </div>
                              {q.avgScore.toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {q.correctRate.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${DIFFICULTY_COLORS[q.difficulty]}20`,
                                color: DIFFICULTY_COLORS[q.difficulty],
                              }}
                            >
                              {q.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {q.discriminationIndex.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {q.avgScore < 50 ? (
                              <span className="text-red-600">Needs Review</span>
                            ) : q.avgScore < 70 ? (
                              <span className="text-yellow-600">Moderate</span>
                            ) : (
                              <span className="text-green-600">Strong</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Demographics Tab */}
            {activeTab === "demographics" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* By Experience */}
                <section className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Performance by Experience Level
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={quizData.demographicBreakdown.byExperience}
                        layout="vertical"
                        margin={{ left: 30, right: 30 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="level" type="category" />
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Average Score"]}
                          labelFormatter={(label) => `Experience: ${label}`}
                        />
                        <Bar dataKey="avgScore" fill="#8B5CF6" radius={[0, 4, 4, 0]}>
                          <LabelList
                            dataKey="avgScore"
                            position="right"
                            formatter={(value) => `${value.toFixed(1)}%`}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* By Department */}
                <section className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Performance by Department
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={quizData.demographicBreakdown.byDepartment}
                        layout="vertical"
                        margin={{ left: 30, right: 30 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="department" type="category" />
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Average Score"]}
                          labelFormatter={(label) => `Department: ${label}`}
                        />
                        <Bar dataKey="avgScore" fill="#EC4899" radius={[0, 4, 4, 0]}>
                          <LabelList
                            dataKey="avgScore"
                            position="right"
                            formatter={(value) => `${value.toFixed(1)}%`}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>
            )}

            {/* Comparison Tab */}
            {activeTab === "comparison" && (
              <section className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Historical Comparison
                </h2>
                <div className="text-center py-12 text-gray-500">
                  <p>Historical comparison data will be displayed here</p>
                  <p className="text-sm mt-2">(Feature coming in next release)</p>
                </div>
              </section>
            )}
          </main>
        </>
      )}
    </div>
  );
}

// Reusable Metric Card Component
function MetricCard({ title, value, icon, threshold }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow border border-gray-100 flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="text-3xl select-none" aria-hidden="true">
          {icon}
        </div>
      </div>
      {threshold && (
        <div className="mt-2 text-xs text-gray-500">
          Passing threshold: {threshold}%
        </div>
      )}
    </div>
  );
}
