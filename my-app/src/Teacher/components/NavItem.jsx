import React from "react";
import { NavLink } from "react-router-dom";

// Predefined tone classes (safe for Tailwind JIT)
const tones = {
  indigo: {
    activeBg: "bg-indigo-50",
    activeText: "text-indigo-700",
    icon: "text-indigo-600",
    iconBg: "bg-indigo-100",
    bar: "bg-gradient-to-b from-indigo-500 to-indigo-600",
    ring: "focus-visible:ring-2 focus-visible:ring-indigo-300",
  },
  sky: {
    activeBg: "bg-sky-50",
    activeText: "text-sky-700",
    icon: "text-sky-600",
    iconBg: "bg-sky-100",
    bar: "bg-gradient-to-b from-sky-500 to-sky-600",
    ring: "focus-visible:ring-2 focus-visible:ring-sky-300",
  },
  emerald: {
    activeBg: "bg-emerald-50",
    activeText: "text-emerald-700",
    icon: "text-emerald-600",
    iconBg: "bg-emerald-100",
    bar: "bg-gradient-to-b from-emerald-500 to-emerald-600",
    ring: "focus-visible:ring-2 focus-visible:ring-emerald-300",
  },
  violet: {
    activeBg: "bg-violet-50",
    activeText: "text-violet-700",
    icon: "text-violet-600",
    iconBg: "bg-violet-100",
    bar: "bg-gradient-to-b from-violet-500 to-violet-600",
    ring: "focus-visible:ring-2 focus-visible:ring-violet-300",
  },
  slate: {
    activeBg: "bg-slate-100",
    activeText: "text-slate-800",
    icon: "text-slate-700",
    iconBg: "bg-slate-200",
    bar: "bg-gradient-to-b from-slate-500 to-slate-600",
    ring: "focus-visible:ring-2 focus-visible:ring-slate-300",
  },
  rose: {
    activeBg: "bg-rose-50",
    activeText: "text-rose-700",
    icon: "text-rose-600",
    iconBg: "bg-rose-100",
    bar: "bg-gradient-to-b from-rose-500 to-rose-600",
    ring: "focus-visible:ring-2 focus-visible:ring-rose-300",
  },
};

export default function NavItem({
  to,
  icon,
  children,
  tone = "indigo",
  collapsed = false,
  onClick,
}) {
  const T = tones[tone] || tones.indigo;

  const Base = ({ isActive }) => (
    <div
      className={[
        "group relative flex items-center gap-3 w-full rounded-xl px-3 py-2.5 transition",
        "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
        "focus:outline-none",
        T.ring,
        isActive ? `${T.activeBg} ${T.activeText} font-semibold` : "",
      ].join(" ")}
    >
      {/* Active left bar */}
      <span
        className={[
          "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-full opacity-0 group-hover:opacity-50 transition",
          T.bar,
          isActive ? "opacity-100" : "",
        ].join(" ")}
        aria-hidden
      />
      {/* Icon pill */}
      <span
        className={[
          "inline-flex h-8 w-8 items-center justify-center rounded-lg text-base transition",
          isActive ? `${T.icon} ${T.iconBg}` : "text-slate-500 bg-slate-100 group-hover:text-slate-700",
        ].join(" ")}
      >
        {icon}
      </span>

      {/* Label */}
      {!collapsed && <span className="truncate">{children}</span>}

      {/* Tooltip on collapsed */}
      {collapsed && (
        <span
          className="pointer-events-none absolute left-[3.25rem] z-20 -translate-y-1/2 top-1/2
          whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white opacity-0
          shadow-lg transition group-hover:opacity-100 group-hover:translate-x-0"
        >
          {children}
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <NavLink
        to={to}
        onClick={onClick}
        className="focus-visible:outline-none rounded-xl"
      >
        {({ isActive }) => <Base isActive={isActive} />}
      </NavLink>
    );
  }

  // Button (e.g., Logout)
  return (
    <button
      onClick={onClick}
      className="w-full text-left focus-visible:outline-none rounded-xl"
      type="button"
    >
      <Base isActive={false} />
    </button>
  );
}