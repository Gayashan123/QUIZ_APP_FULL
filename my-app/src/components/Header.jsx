import React from "react";
import Navigation from "./Navigation";
import ximage from "../assets/Hero.jpg";
import { FaCompass, FaPhoneAlt } from "react-icons/fa";
import Typewriter from "typewriter-effect";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const handleStartQuiz = () => {
    console.log("Start Quiz clicked!");
    // Add modal open logic or scroll-to-section later
  };

  const navigate = useNavigate()

  const handleContact = () => {
    console.log("Contact Us clicked!");
    // Add modal or contact logic later
  };

  return (
    <div
      id="header"
      className="relative w-full min-h-screen bg-cover bg-center overflow-hidden border-b border-neutral-200"
      style={{ backgroundImage: `url(${ximage})` }}
    >
      {/* Glassmorphic Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10" />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-4 pt-28 md:pt-36 pb-20"
      >
        {/* Title */}
        <h1 className="text-white font-bold text-4xl md:text-6xl leading-tight tracking-tight drop-shadow-lg">
          <Typewriter
            options={{
              strings: ["Challenge Your Brain", "Take Fun Quizzes", "Become a Quiz Master!"],
              autoStart: true,
              loop: true,
              delay: 50,
            }}
          />
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-purple-200 text-lg md:text-xl max-w-2xl italic">
          Play exciting quizzes and climb the leaderboard. Test your knowledge across topics in seconds!
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          {/* Start Quiz Button */}
        

          {/* Contact Us Button */}
          <button
            onClick={handleContact}
            className="group flex items-center gap-3 px-6 py-3 bg-white text-gray-900 font-medium rounded-full shadow-md hover:bg-gray-100 hover:scale-105 hover:shadow-xl transition-all"
          >
            <FaPhoneAlt className="text-xl text-gray-800" />
            <span>Contact Us</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
