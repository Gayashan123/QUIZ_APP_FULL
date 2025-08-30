import React, { useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import { Search, Eye, Edit2, Trash2 } from "lucide-react";

const dummyStudents = Array.from({ length: 42 }).map((_, i) => ({
  id: i + 1,
  name: `Student ${i + 1}`,
  email: `student${i + 1}@example.com`,
  quizzesTaken: Math.floor(Math.random() * 10) + 1,
  averageScore: Math.floor(Math.random() * 40) + 60, // Scores between 60-100%
  status: Math.random() > 0.2 ? "Active" : "Inactive",
}));

export default function ManageStudents() {
  // Pagination & search state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Filter students by name/email
  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term === "") return dummyStudents;

    return dummyStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Students to display on current page
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  // Handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Status badge colors
  const statusColors = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
      <Sidebar teacherName="Mr. Smith" />

      <main className="flex-1 flex flex-col overflow-auto">
        <TopNav notifications={[]} />

        <div className="p-6 md:p-8 flex flex-col max-w-7xl mx-auto w-full">
          <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>

            <div className="relative w-full max-w-sm">
              <input
                type="search"
                aria-label="Search students by name or email"
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search students..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </header>

          {/* Table container with horizontal scroll on small screens */}
          <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quizzes Taken
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Average Score
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {currentStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500 text-sm"
                    >
                      No students found.
                    </td>
                  </tr>
                ) : (
                  currentStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate text-sm text-gray-600">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-700">
                        {student.quizzesTaken}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-700">
                        {student.averageScore}%
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[student.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap space-x-1">
                        <button
                          title="View Student"
                          className="group inline-flex items-center justify-center rounded-md p-2 hover:bg-indigo-100 text-indigo-600"
                          type="button"
                          aria-label={`View ${student.name}`}
                          onClick={() => alert(`Viewing details for ${student.name}`)}
                        >
                          <Eye className="w-5 h-5 group-hover:text-indigo-700" />
                        </button>
                        <button
                          title="Edit Student"
                          className="group inline-flex items-center justify-center rounded-md p-2 hover:bg-yellow-100 text-yellow-600"
                          type="button"
                          aria-label={`Edit ${student.name}`}
                          onClick={() => alert(`Editing details for ${student.name}`)}
                        >
                          <Edit2 className="w-5 h-5 group-hover:text-yellow-700" />
                        </button>
                        <button
                          title="Remove Student"
                          className="group inline-flex items-center justify-center rounded-md p-2 hover:bg-red-100 text-red-600"
                          type="button"
                          aria-label={`Remove ${student.name}`}
                          onClick={() =>
                            window.confirm(`Remove ${student.name} from the system?`) &&
                            alert(`${student.name} removed.`)
                          }
                        >
                          <Trash2 className="w-5 h-5 group-hover:text-red-700" />
                        </button>
                      </td>
                    </tr>
                  ))
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

            <span className="text-sm font-medium text-gray-700" aria-live="polite">
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
