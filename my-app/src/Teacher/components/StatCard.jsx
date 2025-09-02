import React, { useMemo } from "react";
import { FaClipboardList, FaUserGraduate, FaCalendarAlt } from "react-icons/fa";

export default function StatCard({ title, value, change, icon }) {
  // Memoize the icon so it only recalculates when `icon` changes
  const renderedIcon = useMemo(() => {
    const iconMap = {
      clipboard: <FaClipboardList className="text-indigo-600" />,
      students: <FaUserGraduate className="text-green-600" />,
      calendar: <FaCalendarAlt className="text-orange-600" />,
    };
    return iconMap[icon] || null;
  }, [icon]);

  // Memoize the displayed value (optional, useful if calculation is heavy)
  const displayedValue = useMemo(() => {
    // Example: you can transform value if needed
    return typeof value === "number" ? value.toLocaleString() : value;
  }, [value]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold mb-2">{displayedValue}</p>
          <p className="text-xs text-gray-500">{change}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          {renderedIcon}
        </div>
      </div>
    </div>
  );
}
