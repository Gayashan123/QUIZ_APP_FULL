import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import MissionImage from "../assets/Mission.jpg";
import VisionImage from "../assets/vision.jpg";
import StoryImage from "../assets/About.jpg";

function About() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <section id="about" className="bg-neutral-100 py-12 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">
      {/* Header */}
      <div className="mb-10 sm:mb-12 text-center" data-aos="fade-down">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-800 tracking-tight">
          About Us
        </h1>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-neutral-500 max-w-xl mx-auto px-2 sm:px-0">
          Learn more about our mission, vision, and journey that power our quiz experience.
        </p>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
        {/* Mission */}
        <div
          className="bg-white/80 backdrop-blur-lg shadow-lg rounded-3xl overflow-hidden p-6 flex flex-col items-center transition-transform hover:scale-[1.03]"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <h2 className="text-xl sm:text-2xl font-medium text-indigo-700 mb-4 text-center">
            Our Mission
          </h2>
          <img
            src={MissionImage}
            alt="Mission"
            className="w-full h-40 object-cover rounded-xl mb-4"
          />
          <p className="text-center text-neutral-600 text-sm sm:text-base">
            To make learning fun and accessible by delivering interactive quizzes that inspire curiosity and boost knowledge retention.
          </p>
        </div>

        {/* Vision */}
        <div
          className="bg-white/80 backdrop-blur-lg shadow-lg rounded-3xl overflow-hidden p-6 flex flex-col items-center transition-transform hover:scale-[1.03]"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <h2 className="text-xl sm:text-2xl font-medium text-indigo-700 mb-4 text-center">
            Our Vision
          </h2>
          <img
            src={VisionImage}
            alt="Vision"
            className="w-full h-40 object-cover rounded-xl mb-4"
          />
          <p className="text-center text-neutral-600 text-sm sm:text-base">
            To become the world's most engaging quiz platform, promoting lifelong learning through innovation and gamification.
          </p>
        </div>

        {/* Story */}
        <div
          className="bg-white/80 backdrop-blur-lg shadow-lg rounded-3xl overflow-hidden p-6 flex flex-col items-center transition-transform hover:scale-[1.03]"
          data-aos="fade-up"
          data-aos-delay="500"
        >
          <h2 className="text-xl sm:text-2xl font-medium text-indigo-700 mb-4 text-center">
            Our Story
          </h2>
          <img
            src={StoryImage}
            alt="Story"
            className="w-full h-40 object-cover rounded-xl mb-4"
          />
          <p className="text-center text-neutral-600 text-sm sm:text-base">
            From a small group of trivia lovers to a global platform, we’ve built a space where anyone can learn, play, and grow.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;
