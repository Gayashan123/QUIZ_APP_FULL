import React, { useContext, useMemo, useState } from "react";
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
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/Auth";
import NavItem from "./NavItem";

export default function Sidebar({ teacherName = "Teacher" }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [collapsed, setCollapsed] = useState(false); // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer

  const initials = useMemo(() => {
    if (!teacherName) return "T";
    return teacherName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  }, [teacherName]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        await fetch("http://127.0.0.1:8000/api/telogout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      localStorage.removeItem("authToken");
      logout?.();
      navigate("/login");
      setMobileOpen(false);
    }
  };

  const nav = [
    { key: "dashboard", label: "Dashboard", to: "/home", icon: <FiBarChart2 />, tone: "indigo" },

    { key: "students", label: "Quizzes", to: "/manage", icon: <FiUsers />, tone: "emerald" },
    { key: "analytics", label: "Analytics", to: "/view", icon: <FaChartBar />, tone: "violet" },
    { key: "settings", label: "Settings", to: "/settings", icon: <FiSettings />, tone: "slate" },
    // Logout is a button (no NavLink)
    { key: "logout", label: "Logout", icon: <FiLogOut />, tone: "rose", onClick: handleLogout },
  ];

  const Brand = (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-sm flex items-center justify-center text-white font-extrabold"
        aria-hidden
      >
        JQ
      </div>
      {!collapsed && (
        <div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent leading-tight">
            JuizzQuiz
          </h1>
          <p className="text-xs text-slate-500 -mt-0.5">Teacher Portal</p>
        </div>
      )}
    </div>
  );

  const UserCard = (
    <div className={`mt-auto pt-6 border-t border-slate-200 ${collapsed ? "px-0" : ""}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
          {initials}
        </div>
        {!collapsed && (
          <div>
            <p className="font-medium truncate max-w-[10rem]">{teacherName}</p>
            <p className="text-xs text-slate-500">Teacher</p>
          </div>
        )}
      </div>
    </div>
  );

  // Desktop Sidebar
  const Desktop = (
    <aside
      className={`hidden md:flex flex-col ${
        collapsed ? "w-20" : "w-64"
      } bg-white/90 backdrop-blur border-r border-slate-200 p-4 sticky top-0 h-screen transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-6">
        {Brand}
        <button
          className="hidden md:inline-flex p-2 rounded-xl hover:bg-slate-100 transition"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <FiMenu />
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {nav.map((item) =>
          item.to ? (
            <NavItem
              key={item.key}
              to={item.to}
              icon={item.icon}
              tone={item.tone}
              collapsed={collapsed}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </NavItem>
          ) : (
            <NavItem
              key={item.key}
              icon={item.icon}
              tone={item.tone}
              collapsed={collapsed}
              onClick={item.onClick}
            >
              {item.label}
            </NavItem>
          )
        )}
      </nav>

      {UserCard}
    </aside>
  );

  // Mobile button (floating)
  const MobileToggle = (
    <div className="md:hidden fixed top-4 right-4 z-50">
      <button
        onClick={() => setMobileOpen(true)}
        className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg active:scale-95 transition"
        aria-label="Open menu"
      >
        <FiMenu size={22} />
      </button>
    </div>
  );

  // Mobile Drawer
  const Mobile = (
    <div className={`md:hidden ${mobileOpen ? "block" : "hidden"}`}>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
      <div
        className={`fixed left-0 top-0 bottom-0 z-50 w-4/5 max-w-sm bg-white shadow-2xl p-5 flex flex-col
        transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-6">
          {Brand}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-100 transition"
            aria-label="Close menu"
          >
            <FiX size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {nav.map((item) =>
            item.to ? (
              <NavItem
                key={item.key}
                to={item.to}
                icon={item.icon}
                tone={item.tone}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavItem>
            ) : (
              <NavItem
                key={item.key}
                icon={item.icon}
                tone={item.tone}
                onClick={item.onClick}
              >
                {item.label}
              </NavItem>
            )
          )}
        </nav>

        {UserCard}
      </div>
    </div>
  );

  return (
    <>
      {Desktop}
      {MobileToggle}
      {Mobile}
    </>
  );
}