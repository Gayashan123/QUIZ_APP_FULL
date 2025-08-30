import { useEffect, useState } from "react";
import Hero from "../assets/Hero.jpg";
import { FaCompass, FaPhoneAlt } from "react-icons/fa";
import Typewriter from "typewriter-effect";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const NEWS_API = "https://api.spaceflightnewsapi.net/v4/articles/?limit=5";

export default function QuizHero() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch(NEWS_API)
      .then((res) => res.json())
      .then((data) => setNews(data.results || []));
  }, []);

  const handleContact = () => {
    // Ideally, open a modal or navigate to contact page
    alert("Contact Us clicked!");
  };

  return (
    <div
      id="header"
      className="relative w-full min-h-screen bg-cover bg-center overflow-hidden border-b border-neutral-200"
      style={{ backgroundImage: `url(${Hero})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-10" />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-4 pt-24 md:pt-36 pb-10"
      >
        {/* Title */}
        <h1 className="text-white font-semibold text-4xl md:text-6xl leading-tight tracking-tight drop-shadow-xl">
          <Typewriter
            options={{
              strings: [
                "Challenge Your Brain",
                "Take Fun Quizzes",
                "Become a Quiz Master!",
              ],
              autoStart: true,
              loop: true,
              delay: 50,
            }}
          />
        </h1>

        {/* Subtitle */}
        <p className="mt-8 text-purple-100 text-lg md:text-2xl max-w-2xl italic font-light">
          Play exciting quizzes and climb the leaderboard. Test your knowledge across topics in seconds!
        </p>

        {/* Buttons */}
        
      </motion.div>

      {/* News Carousel */}
      {news.length > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-md z-30 overflow-x-auto whitespace-nowrap p-4 flex gap-6 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {news.map((item) => (
            <motion.a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[220px] max-w-[250px] bg-white/10 border border-white/20 p-3 rounded-xl hover:scale-105 transition-transform duration-300 shadow-lg flex-shrink-0"
              whileHover={{ scale: 1.07 }}
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="h-28 w-full object-cover rounded-lg mb-2"
              />
              <p className="text-sm text-white font-medium line-clamp-2">{item.title}</p>
            </motion.a>
          ))}
        </motion.div>
      )}
    </div>
  );
}
