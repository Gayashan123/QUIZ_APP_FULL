import React, { useContext, useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiBarChart2, FiUsers, FiSettings, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { FaChartBar } from "react-icons/fa"; // Correct import
import { AuthContext } from "../../context/Auth";
import api from "../../Admin/common/api";

/* Small router-aware nav item */
function SideLink({ to, icon, label, collapsed = false, end = false, onClick }) {
  const base =
    "group flex items-center gap-3 px-3 py-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-slate-300";

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          base,
          "text-slate-700 hover:bg-slate-50",
          "border border-transparent",
          isActive ? "bg-white shadow-sm border border-slate-200" : "",
          collapsed ? "justify-center" : "",
        ].join(" ")
      }
      title={collapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              "inline-flex items-center justify-center h-9 w-9 rounded-lg border",
              isActive
                ? "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-transparent shadow"
                : "bg-white text-slate-700 border-slate-200",
            ].join(" ")}
            aria-hidden
          >
            {icon}
          </span>
          {!collapsed && <span className="flex-1 truncate font-medium">{label}</span>}
          {isActive && !collapsed && (
            <span className="ml-auto h-6 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-700" />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function StudentSidebar({ studentName = "Student User" }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("student:sidebar:collapsed") === "1"
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("student:sidebar:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const initials = useMemo(() => {
    if (!studentName) return "S";
    return studentName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0].toUpperCase())
      .slice(0, 2)
      .join("");
  }, [studentName]);

  // Spinner component
  function Spinner({ size = "4" }) {
    return (
      <div
        className={`w-${size} h-${size} border-2 border-t-2 border-t-transparent border-gray-200 rounded-full animate-spin`}
      />
    );
  }

  // Student logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await api.get("stlogout"); // Student logout endpoint
    } catch (err) {
      console.error("Student logout failed:", err);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
      logout?.();
      navigate("/login", { replace: true });
      setMobileOpen(false);
      setIsLoading(false);
    }
  };

  const nav = [
    { key: "dashboard", label: "Dashboard", to: "/student", icon: <FiBarChart2 /> },
    { key: "quizzes", label: "Quizzes", to: "/studentquiz", icon: <FiUsers /> },
    { key: "analytics", label: "Analytics", to: "/analytics", icon: <FaChartBar /> },
    { key: "settings", label: "Settings", to: "/settings1", icon: <FiSettings /> },
  ];

  const Brand = (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-sm flex items-center justify-center text-white font-extrabold">
        TQ
      </div>
      {!collapsed && (
        <div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent leading-tight">
            Student Quiz
          </h1>
          <p className="text-xs text-slate-500 -mt-0.5">Student Portal</p>
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
          <div className="min-w-0">
            <p className="font-medium truncate">{studentName}</p>
            <p className="text-xs text-slate-500">Student</p>
          </div>
        )}
      </div>
    </div>
  );

  const DesktopSidebar = (
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

      <nav className="flex flex-col gap-1" aria-label="Main navigation">
        {nav.map(({ key, ...props }) => (
          <SideLink key={key} {...props} collapsed={collapsed} />
        ))}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoading}
          className={`mt-2 group flex items-center gap-3 px-3 py-2 rounded-xl transition text-rose-700 hover:bg-rose-50 ${
            collapsed ? "justify-center" : ""
          } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
          title={collapsed ? "Logout" : undefined}
        >
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg border bg-white text-rose-700 border-slate-200">
            {isLoading ? <Spinner size="4" /> : <FiLogOut />}
          </span>
          {!collapsed && <span className="font-medium">{isLoading ? "Logging out..." : "Logout"}</span>}
        </button>
      </nav>

      {UserCard}
    </aside>
  );

  const MobileToggleButton = (
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

  const MobileSidebar = (
    <div className={`md:hidden ${mobileOpen ? "block" : "hidden"}`}>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      <div
        className={`fixed left-0 top-0 bottom-0 z-50 w-4/5 max-w-sm bg-white shadow-2xl p-5 flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-6">
          {Brand}
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 transition">
            <FiX size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <SideLink key={item.key} {...item} collapsed={false} />
          ))}

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            className="mt-2 group flex items-center gap-3 px-3 py-2 rounded-xl transition text-rose-700 hover:bg-rose-50 border border-transparent"
          >
            <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg border bg-white text-rose-700 border-slate-200">
              {isLoading ? <Spinner size="4" /> : <FiLogOut />}
            </span>
            <span className="font-medium">{isLoading ? "Logging out..." : "Logout"}</span>
          </button>
        </nav>

        {UserCard}
      </div>
    </div>
  );

  return (
    <>
      {DesktopSidebar}
      {MobileToggleButton}
      {MobileSidebar}
    </>
  );
}
