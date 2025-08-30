import { useState } from "react";
import {
  FaHome,
  FaCog,
  FaHeart,
  FaTrophy,
  FaPlay,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";


function QuizNavbar() {
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState("home");

const navigate = useNavigate();

  
  const navItems = [
    {
      icon: <FaHome />,
      label: "Home",
     onClick: () => navigate("/")
    },
    {
      icon: <FaHeart />,
      label: "My Quizzes",
      onClick: () => setActiveView("my-quizzes"),
    },
    {
      icon: <FaPlay />,
      label: "Start Quiz",
      onClick: () => setActiveView("start-quiz"),
    },
    {
      icon: <FaTrophy />,
      label: "Leaderboard",
      onClick: () => setActiveView("leaderboard"),
    },
    {
      icon: <FaCog />,
      label: "Settings",
      onClick: () => setShowSettings(true),
    },
  ];

  return (
    <>
      {/* Bottom Navbar */}
      <aside className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/70 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-full px-6 py-4 z-50 flex gap-4 md:gap-6 lg:gap-8">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="group relative"
            aria-label={item.label}
          >
            <div className="p-3 bg-white rounded-full hover:shadow-xl transition-all duration-300 group-hover:scale-110 border border-gray-300 hover:border-purple-500 hover:bg-purple-50">
              <span className="text-gray-600 group-hover:text-purple-600 text-xl">
                {item.icon}
              </span>
            </div>
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-700 bg-white px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none">
              {item.label}
            </span>
          </button>
        ))}
      </aside>

      {/* Active View Rendering */}
      <div className="mt-8 p-4">
        {activeView === "home" && <h2 className="text-2xl font-bold">Welcome to Quiz Home</h2>}
        {activeView === "my-quizzes" && <h2 className="text-2xl font-bold">Your Saved Quizzes</h2>}
        {activeView === "start-quiz" && <h2 className="text-2xl font-bold">Start a New Quiz</h2>}
        {activeView === "leaderboard" && <h2 className="text-2xl font-bold">Leaderboard Rankings</h2>}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-sm text-gray-600 mb-4">Customize your quiz preferences.</p>
            <button
              onClick={() => setShowSettings(false)}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default QuizNavbar;
