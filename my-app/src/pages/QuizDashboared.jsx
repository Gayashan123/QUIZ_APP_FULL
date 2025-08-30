import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import QuizNavbar from "../components/BottomNavbar";
import QuizHero from "../components/QuizHero";

const quizCategories = [
  {
    id: 1,
    title: "Practical Quiz",
    image: "https://img.freepik.com/free-vector/practical-training-concept_23-2148794764.jpg",
  },
  {
    id: 2,
    title: "Programming Logic",
    image: "https://img.freepik.com/free-vector/programming-concept-illustration_114360-1351.jpg",
  },
  {
    id: 3,
    title: "HTML/CSS Basics",
    image: "https://img.freepik.com/free-vector/html5-programming-language-computer-technology_53876-126043.jpg",
  },
  {
    id: 4,
    title: "JavaScript Test",
    image: "https://img.freepik.com/free-vector/javascript-frameworks-concept_23-2148807384.jpg",
  },
  {
    id: 5,
    title: "Computer Networks",
    image: "https://img.freepik.com/free-vector/data-networking-concept-illustration_114360-3551.jpg",
  },
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("quizFavorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Toggle favorite quiz
  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id];
      localStorage.setItem("quizFavorites", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white pb-24">
      {/* Hero with News Carousel */}
      <QuizHero />

      {/* Apple-Style Section Title */}
<div className="max-w-7xl mx-auto px-6 mt-16 text-center">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 drop-shadow-sm">
      Explore Practical Quizzes
    </h2>

    <div className="mt-4 mx-auto max-w-2xl">
      <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed">
        Sharpen your skills with carefully crafted, real-world questions across your favorite tech topics.
      </p>
    </div>

    <div className="mt-6 h-1 w-24 mx-auto bg-gradient-to-r from-purple-500 via-pink-400 to-purple-500 rounded-full shadow-lg opacity-80" />
  </motion.div>
</div>


      {/* Quiz Grid */}
      <motion.div
        className=" max-w-7xl mx-auto px-6 mt-10 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
      >
        {quizCategories.map((quiz) => {
          const isFavorite = favorites.includes(quiz.id);
          return (
            <motion.div
              key={quiz.id}
              className="relative bg-white/10 border border-white/20 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl hover:shadow-2xl transition duration-300 flex flex-col"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              {/* Favorite Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(quiz.id);
                }}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                className="absolute top-4 right-4 z-10 text-white text-xl p-1 rounded-full bg-black/40 hover:bg-black/70"
              >
                {isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
              </button>

              {/* Image */}
              <img
                src={quiz.image}
                alt={quiz.title}
                className="w-full h-44 sm:h-52 object-cover rounded-t-2xl"
                loading="lazy"
              />

              {/* Content */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
                <p className="text-white/70 text-sm mb-5 flex-grow">
                  Attempt the {quiz.title} to boost your practical understanding.
                </p>
                <button
                  onClick={() => navigate("/quiz")}
                  className="mt-auto bg-purple-600 hover:bg-purple-700 transition px-5 py-3 rounded-full font-semibold text-white"
                >
                  Attempt Quiz
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom Navigation */}
      <QuizNavbar />
    </div>
  );
}
