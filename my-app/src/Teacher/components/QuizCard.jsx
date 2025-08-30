import React from "react";
import { FaChevronRight } from "react-icons/fa";

export default function QuizCard({ quiz }) {
  return (
    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition">
      <div>
        <h3 className="font-medium">{quiz.title}</h3>
        <div className="flex gap-4 mt-1">
          <span className="text-xs text-gray-500">{quiz.subject}</span>
          <span className="text-xs text-gray-500">{quiz.submissions} submissions</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{quiz.date}</span>
        <button className="text-gray-400 hover:text-indigo-600">
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
}
