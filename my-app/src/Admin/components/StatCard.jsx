// components/admin/AdminStatCard.jsx
import React from "react";

export default function AdminStatCard({ title, value, change, icon, color }) {
  return (
    <div className={`${color} text-white rounded-xl shadow-sm p-6`}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-indigo-100 mb-1">{title}</p>
          <p className="text-3xl font-bold mb-2">{value}</p>
          <p className="text-xs text-indigo-200">{change}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-black bg-opacity-10 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
