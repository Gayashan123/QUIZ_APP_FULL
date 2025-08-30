// components/admin/AdminActionButton.jsx
import React from "react";

export default function AdminActionButton({ icon, label }) {
  return (
    <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 transition text-left">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );
}
