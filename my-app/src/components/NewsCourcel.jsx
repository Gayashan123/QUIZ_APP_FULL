import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function NewsCarousel({ news }) {
  const scrollRef = useRef(null);
  const scrollSpeed = 0.5; // Adjust for faster or slower scroll
  const intervalTime = 30; // Smaller = smoother

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    let isHovered = false;

    const scroll = () => {
      if (scrollContainer && !isHovered) {
        scrollContainer.scrollLeft += scrollSpeed;
        if (
          scrollContainer.scrollLeft + scrollContainer.clientWidth >=
          scrollContainer.scrollWidth
        ) {
          scrollContainer.scrollLeft = 0;
        }
      }
    };

    const interval = setInterval(scroll, intervalTime);

    scrollContainer.addEventListener("mouseenter", () => (isHovered = true));
    scrollContainer.addEventListener("mouseleave", () => (isHovered = false));

    return () => clearInterval(interval);
  }, []);

  if (!news.length) return null;

  return (
    <motion.div
      ref={scrollRef}
      className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-md z-30 whitespace-nowrap overflow-x-auto scroll-smooth flex gap-6 p-4 items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
    >
      {news.concat(news).map((item, index) => (
        <motion.a
          key={index}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-[230px] max-w-[240px] bg-white/10 border border-white/20 p-3 rounded-xl hover:scale-105 transition-transform duration-300 shadow-lg flex-shrink-0"
          whileHover={{ scale: 1.07 }}
        >
          <img
            src={item.image_url}
            alt={item.title}
            className="h-28 w-full object-cover rounded-lg mb-2"
            loading="lazy"
          />
          <p className="text-sm text-white font-medium line-clamp-2">{item.title}</p>
        </motion.a>
      ))}
    </motion.div>
  );
}
