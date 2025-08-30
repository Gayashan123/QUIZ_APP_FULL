import React, { useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import { Search, Eye, Save } from "lucide-react";

const dummyQuizzes = [
  { id: "q1", title: "Math Quiz 1" },
  { id: "q2", title: "Science Quiz 1" },
  { id: "q3", title: "History Quiz" },
];

// Dummy submission data
const dummySubmissions = Array.from({ length: 38 }).map((_, i) => {
  const quiz = dummyQuizzes[i % dummyQuizzes.length];
  const graded = Math.random() > 0.3;
  return {
    id: i + 1,
    studentName: `Student ${i + 1}`,
    quizId: quiz.id,
    quizTitle: quiz.title,
    submissionDate: new Date(Date.now() - i * 86400000).toISOString(), // varied dates
    grade: graded ? (Math.floor(Math.random() * 41) + 60) : null, // 60-100 or ungraded
    graded,
  };
});

export default function GradeSubmissions() {
  // States & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const submissionsPerPage = 10;
  // Track grades being edited locally
  const [editedGrades, setEditedGrades] = useState({});

  // Filter and search
  const filteredSubmissions = useMemo(() => {
    let filtered = dummySubmissions;

    if (selectedQuiz) {
      filtered = filtered.filter((s) => s.quizId === selectedQuiz);
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.studentName.toLowerCase().includes(term) ||
          s.quizTitle.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [searchTerm, selectedQuiz]);

  const totalPages = Math.ceil(filteredSubmissions.length / submissionsPerPage);

  const currentSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * submissionsPerPage,
    currentPage * submissionsPerPage
  );

  // Handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleQuizFilterChange = (e) => {
    setSelectedQuiz(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Grade input handler
  const handleGradeChange = (id, value) => {
    // only numbers 0-100 allowed
    if (value === "" || (/^\d*$/.test(value) && Number(value) <= 100)) {
      setEditedGrades((prev) => ({ ...prev, [id]: value }));
    }
  };

  // Save grade handler
  const handleSaveGrade = (submission) => {
    const gradeStr = editedGrades[submission.id];
    const gradeNum = Number(gradeStr);

    if (gradeStr === undefined || gradeStr === "") {
      alert("Grade cannot be empty.");
      return;
    }
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      alert("Please enter a valid grade between 0 and 100.");
      return;
    }

    // In real app, perform API call here to save grade
    alert(
      `Saved grade ${gradeNum}% for ${submission.studentName} on "${submission.quizTitle}"`
    );

    // Update local dummy data to simulate save (in real app, reload data)
    submission.grade = gradeNum;
    submission.graded = true;
    const newEdited = { ...editedGrades };
    delete newEdited[submission.id];
    setEditedGrades(newEdited);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
      <Sidebar teacherName="Mr. Smith" />

      <main className="flex-1 flex flex-col overflow-auto">
        <TopNav notifications={[]} />

        <div className="p-6 md:p-8 flex flex-col max-w-7xl mx-auto w-full">
          <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Grade Submissions</h1>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
              <div className="relative flex-grow">
                <input
                  type="search"
                  aria-label="Search submissions by student name or quiz title"
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="Search student or quiz title..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              <select
                aria-label="Filter submissions by quiz"
                className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedQuiz}
                onChange={handleQuizFilterChange}
              >
                <option value="">All Quizzes</option>
                {dummyQuizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
            </div>
          </header>

          <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[18%]"
                  >
                    Student Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[18%]"
                  >
                    Quiz Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]"
                  >
                    Submission Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[13%]"
                  >
                    Grade (%)
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]"
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {currentSubmissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No submissions found.
                    </td>
                  </tr>
                ) : (
                  currentSubmissions.map((submission) => {
                    const editedValue = editedGrades[submission.id];
                    const displayGrade =
                      editedValue !== undefined ? editedValue : submission.grade ?? "";

                    return (
                      <tr key={submission.id}>
                        <td className="px-6 py-4 whitespace-nowrap max-w-[180px] truncate text-sm font-medium text-gray-900">
                          {submission.studentName}
                        </td>
                        <td className="px-6 py-4 max-w-[180px] whitespace-nowrap truncate text-sm text-gray-600">
                          {submission.quizTitle}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-700">
                          {new Date(submission.submissionDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap text-sm">
                          {/* Grade Edit Input */}
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min={0}
                            max={100}
                            className="w-16 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            aria-label={`Grade input for ${submission.studentName}`}
                            value={displayGrade}
                            onChange={(e) =>
                              handleGradeChange(submission.id, e.target.value)
                            }
                            maxLength={3}
                          />
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              submission.graded
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                            aria-label={submission.graded ? "Graded" : "Not graded"}
                            title={submission.graded ? "Graded" : "Not graded"}
                          >
                            {submission.graded ? "Graded" : "Not Graded"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap space-x-2">
                          <button
                            title={`Save grade for ${submission.studentName}`}
                            className="group inline-flex items-center justify-center rounded-md p-2 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-300 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500"
                            type="button"
                            onClick={() => handleSaveGrade(submission)}
                            disabled={
                              editedValue === undefined ||
                              editedValue === "" ||
                              editedValue === submission.grade?.toString()
                            }
                          >
                            <Save className="w-5 h-5" />
                          </button>
                          <button
                            title={`View submission for ${submission.studentName}`}
                            className="group inline-flex items-center justify-center rounded-md p-2 hover:bg-indigo-100 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                            type="button"
                            onClick={() =>
                              alert(`Viewing submission details for ${submission.studentName}`)
                            }
                          >
                            <Eye className="w-5 h-5 group-hover:text-indigo-700" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <nav
            aria-label="Pagination"
            className="mt-6 flex justify-center items-center space-x-3 select-none"
          >
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md border border-gray-300 ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-disabled={currentPage === 1}
              aria-label="Previous page"
            >
              Previous
            </button>

            <span
              className="text-sm font-medium text-gray-700"
              aria-live="polite"
              aria-atomic="true"
            >
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md border border-gray-300 ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </nav>
        </div>
      </main>
    </div>
  );
}
