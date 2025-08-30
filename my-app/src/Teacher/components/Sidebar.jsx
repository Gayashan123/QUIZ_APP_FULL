import React, { useState, useContext } from "react";
import {
  FiBarChart2,
  FiBook,
  FiUsers,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
} from "react-icons/fi";
import { FaChartBar } from "react-icons/fa";
import NavItem from "./NavItem";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/Auth";

export default function Sidebar({ teacherName }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  // 🔹 Logout function
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        await fetch("http://127.0.0.1:8000/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Clear local storage & context
      localStorage.removeItem("authToken");
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile Menu Button (only visible on small screens) */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-indigo-600 text-white shadow-lg"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6 sticky top-0 h-screen">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-indigo-700">JuizzQuiz</h1>
          <p className="text-sm text-gray-500">Teacher Portal</p>
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem icon={<FiBarChart2 />} active>
            Dashboard
          </NavItem>
          <NavItem icon={<FiBook />} onClick={() => navigate("/createquiz")}>
            My Quizzes
          </NavItem>
          <NavItem icon={<FiUsers />} onClick={() => navigate("/manage")}>
            Students
          </NavItem>
          <NavItem icon={<FaChartBar />} onClick={() => navigate("/view")}>
            Analytics
          </NavItem>
          <NavItem icon={<FiSettings />} onClick={() => navigate("/settings")}>
            Settings
          </NavItem>
          <NavItem icon={<FiLogOut />} onClick={handleLogout}>
            Logout
          </NavItem>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {teacherName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p className="font-medium">{teacherName}</p>
              <p className="text-xs text-gray-500">Teacher</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Sidebar Content */}
          <div className="relative flex flex-col w-4/5 max-w-sm h-full bg-white shadow-xl p-6">
            <div className="mb-10">
              <h1 className="text-2xl font-bold text-indigo-700">JuizzQuiz</h1>
              <p className="text-sm text-gray-500">Teacher Portal</p>
            </div>

            <nav className="flex flex-col gap-1">
              <NavItem icon={<FiBarChart2 />} active>
                Dashboard
              </NavItem>
              <NavItem
                icon={<FiBook />}
                onClick={() => navigate("/createquiz")}
              >
                My Quizzes
              </NavItem>
              <NavItem icon={<FiUsers />} onClick={() => navigate("/manage")}>
                Students
              </NavItem>
              <NavItem icon={<FaChartBar />} onClick={() => navigate("/view")}>
                Analytics
              </NavItem>
              <NavItem
                icon={<FiSettings />}
                onClick={() => navigate("/settings")}
              >
                Settings
              </NavItem>
              <NavItem icon={<FiLogOut />} onClick={handleLogout}>
                Logout
              </NavItem>
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  {teacherName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-medium">{teacherName}</p>
                  <p className="text-xs text-gray-500">Teacher</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
