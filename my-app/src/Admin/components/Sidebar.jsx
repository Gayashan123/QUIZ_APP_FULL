import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  FiBriefcase,
  FiBook,
  FiLayers,
  FiUsers,
  FiMenu,
  FiX,
  FiHome,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/Auth";

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
          {!collapsed && (
            <span className="flex-1 truncate font-medium">{label}</span>
          )}
          {isActive && !collapsed && (
            <span className="ml-auto h-6 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-700" />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ adminName = "Admin User" }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [collapsed, setCollapsed] = useState(() => {
    try {
      const v = localStorage.getItem("admin:sidebar:collapsed");
      return v === "1";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem("admin:sidebar:collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  // Initials for avatar
  const initials = useMemo(() => {
    if (!adminName) return "A";
    return adminName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  }, [adminName]);

  // Logout flow: prefer GET /api/logout (Laravel), fallback to POST
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        let ok = false;
        try {
          const res = await fetch("http://127.0.0.1:8000/api/logout", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          ok = res.ok;
        } catch {}
        if (!ok) {
          await fetch("http://127.0.0.1:8000/api/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
      logout?.();
      navigate("/loginpage", { replace: true });
      setMobileOpen(false);
      setIsLoading(false);
    }
  };

  const nav = [
    { key: "dashboard", label: "Dashboard", to: "/admin", icon: <FiHome />, end: true },
    { key: "students", label: "Student Management", to: "/createst", icon: <FiBook /> },
    { key: "teachers", label: "Teacher Management", to: "/createte", icon: <FiUsers /> },
    { key: "faculty", label: "Faculty Management", to: "/createfu", icon: <FiBriefcase /> },
    { key: "subjects", label: "Subject Management", to: "/createsu", icon: <FiLayers /> },
    { key: "settings", label: "Settings", to: "/settings", icon: <FiSettings /> },
  ];

  // Branding
  const Brand = (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-sm flex items-center justify-center text-white font-extrabold">
        JQ
      </div>
      {!collapsed && (
        <div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent leading-tight">
            JuizzQuiz
          </h1>
          <p className="text-xs text-slate-500 -mt-0.5">Admin Portal</p>
        </div>
      )}
    </div>
  );

  // User info card
  const UserCard = (
    <div className={`mt-auto pt-6 border-t border-slate-200 ${collapsed ? "px-0" : ""}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
          {initials}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-medium truncate">{adminName}</p>
            <p className="text-xs text-slate-500">Administrator</p>
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
      aria-label="Admin sidebar"
    >
      <div className="flex items-center justify-between mb-6">
        {Brand}
        <button
          className="hidden md:inline-flex p-2 rounded-xl hover:bg-slate-100 transition"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand" : "Collapse"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FiMenu />
        </button>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Main navigation">
        {nav.map((item) => (
          <SideLink
            key={item.key}
            to={item.to}
            icon={item.icon}
            label={item.label}
            end={item.end}
            collapsed={collapsed}
          />
        ))}

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoading}
          className={[
            "mt-2 group flex items-center gap-3 px-3 py-2 rounded-xl transition border border-transparent",
            "text-rose-700 hover:bg-rose-50",
            collapsed ? "justify-center" : "",
            isLoading ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}
          title={collapsed ? "Logout" : undefined}
        >
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg border bg-white text-rose-700 border-slate-200">
            <FiLogOut />
          </span>
          {!collapsed && <span className="font-medium">{isLoading ? "Logging out..." : "Logout"}</span>}
        </button>
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
        transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-sm flex items-center justify-center text-white font-extrabold">
              JQ
            </div>
            <div>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent leading-tight">
                JuizzQuiz
              </h1>
              <p className="text-xs text-slate-500 -mt-0.5">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-100 transition"
            aria-label="Close menu"
          >
            <FiX size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
          {nav.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 px-3 py-2 rounded-xl transition",
                  "text-slate-700 hover:bg-slate-50",
                  isActive ? "bg-white shadow-sm border border-slate-200" : "border border-transparent",
                ].join(" ")
              }
            >
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg border bg-white text-slate-700 border-slate-200">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            className="mt-2 group flex items-center gap-3 px-3 py-2 rounded-xl transition text-rose-700 hover:bg-rose-50 border border-transparent"
          >
            <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg border bg-white text-rose-700 border-slate-200">
              <FiLogOut />
            </span>
            <span className="font-medium">{isLoading ? "Logging out..." : "Logout"}</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{adminName}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
        </div>
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