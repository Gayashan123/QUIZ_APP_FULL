import React from "react";
import { FaBell } from "react-icons/fa";

export default function NotificationItem({ notification }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mt-1">
        <FaBell size={14} />
      </div>
      <div>
        <p className="text-sm">{notification.message}</p>
        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
      </div>
    </div>
  );
}
