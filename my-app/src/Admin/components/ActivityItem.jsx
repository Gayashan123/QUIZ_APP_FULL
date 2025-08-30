// components/admin/ActivityItem.jsx
import React from "react";
import { FaUserCog } from "react-icons/fa";

export default function ActivityItem({ activity }) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mt-1">
        <FaUserCog size={14} />
      </div>
      <div className="flex-1">
        <p className="font-medium">{activity.action}</p>
        <div className="flex justify-between mt-1">
          <p className="text-sm text-gray-600">by {activity.user}</p>
          <p className="text-xs text-gray-500">{activity.time}</p>
        </div>
      </div>
    </div>
  );
}
