import { FaChevronRight } from "react-icons/fa";

export default function QuizCard({ quiz }) {
  return (
    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition">
      <div>
        <h3 className="font-medium">{quiz.title}</h3>
        <div className="flex gap-4 mt-1 text-xs text-gray-500">
          <span>{quiz.subject}</span>
          <span>{quiz.duration}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-sm px-3 py-1 rounded-full ${quiz.dueDate === "Tomorrow" ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
          {quiz.dueDate}
        </span>
        <button className="text-gray-400 hover:text-indigo-600">
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
}
