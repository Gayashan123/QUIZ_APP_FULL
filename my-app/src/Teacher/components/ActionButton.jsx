import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaChartBar,
  FaUserGraduate,
  FaClipboardList,
} from "react-icons/fa";

export default function ActionButton({ type }) {
  const navigate = useNavigate();

  const actionMap = {
    createQuiz: {
      icon: <FaPlusCircle className="text-indigo-600" />,
      title: "Create New Quiz",
      onClick: () => navigate("/createquiz"),
      description: "Design a new quiz for your class",
      color: "bg-indigo-50",
    },
    viewAnalytics: {
      icon: <FaChartBar className="text-purple-600" />,
      title: "View Analytics",
      onClick: () => navigate("/view"),
      description: "See performance insights",
      color: "bg-purple-50",
    },
    manageStudents: {
      icon: <FaUserGraduate className="text-green-600" />,
      title: "Manage Students",
      onClick: () => navigate("/manage"),
      description: "Add or remove students",
      color: "bg-green-50",
    },
    gradeSubmissions: {
      icon: <FaClipboardList className="text-blue-600" />,
      title: "Grade Submissions",
     onClick: () => navigate("/grade"),
      description: "Review student answers",
      color: "bg-blue-50",
    },
  };

  const { icon, title, description, color, onClick } = actionMap[type] || {};

  return (
    <button
      onClick={onClick}
      className={`${color} hover:bg-opacity-70 transition p-4 rounded-lg text-left w-full cursor-pointer`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </button>
  );
}
