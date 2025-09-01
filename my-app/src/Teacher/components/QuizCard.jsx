// src/Teacher/components/QuizCard.jsx
import React from "react";

export default function QuizCard({ quiz }) {
  if (!quiz) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4 shadow-sm">
      {/* Quiz Name */}
      <h3 className="text-lg font-semibold text-slate-900">{quiz.name || quiz.quiz_title || "Untitled Quiz"}</h3>
      
    

      {/* Created At */}
      <p className="text-sm text-slate-500 mt-1">
        Sta-Date: {quiz.start_time ? new Date(quiz.start_time).toLocaleDateString() : "Unknown"}
      </p>

      {/* Optional: Updated At */}
      <p className="text-sm text-slate-500 mt-1">
        End-Date:     {quiz.end_time ? new Date(quiz.end_time).toLocaleDateString() : "Unknown"}
      </p>
    </div>
  );
}
