import React, { useContext, useState } from "react";
import {
  FiBriefcase,
  FiBook,
  FiLayers,
  FiUsers,
  FiMenu,
  FiX,
  FiHome,
  FiLogOut,
} from "react-icons/fi";
import NavItem from "./NavItem";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/Auth";

export default function Sidebar({ adminName = "Admin User" }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  // Navigation items configuration
  const navItems = [
    { icon: <FiHome />, label: "Dashboard", path: "/admin", active: location.pathname === "/admin" },
    { icon: <FiBook />, label: "Student Management", path: "/createst", active: location.pathname === "/createst" },
    { icon: <FiUsers />, label: "Teacher Management", path: "/createte", active: location.pathname === "/createte" },
    { icon: <FiBriefcase />, label: "Faculty Management", path: "/createfu", active: location.pathname === "/createfu" },
    { icon: <FiLayers />, label: "Subject Management", path: "/createsu", active: location.pathname === "/createsu" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // 🔹 Logout function
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Optionally, send logout request to server
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

      // Clear auth data
      localStorage.removeItem("authToken");
      logout(); // Clear user from context

      // Redirect to login page
      navigate("/loginpage");
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0] || "")
      .join("")
      .toUpperCase();
  };

  const displayName = adminName;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6 fixed top-0 left-0 h-screen z-40">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-indigo-700">JuizzQuiz</h1>
          <p className="text-sm text-gray-500">Admin Portal</p>
        </div>

        <nav className="flex flex-col gap-1 flex-grow">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              active={item.active}
              onClick={() => handleNavigation(item.path)}
            >
              {item.label}
            </NavItem>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
          >
            <FiLogOut />
            <span>{isLoading ? "Logging out..." : "Logout"}</span>
          </button>
        </nav>

        {/* Admin Info */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {getInitials(displayName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{displayName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
