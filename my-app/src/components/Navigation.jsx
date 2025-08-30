import React, { useState } from "react";
import { Link } from "react-scroll";
import { useNavigate } from "react-router-dom";

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: "header", label: "Home" },
    { to: "about", label: "About" },
    { to: "contact", label: "Contact" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="absolute top-0 left-0 z-50 w-full backdrop-blur-md bg-white/80 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-extrabold tracking-tight text-gray-900 select-none">
          Jeuizz Quiz
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              smooth
              duration={400}
              spy
              offset={-60}
              activeClass="text-teal-600 font-semibold border-b-2 border-teal-600"
              className="text-gray-900 hover:text-teal-600 cursor-pointer transition-all duration-200 pb-1"
            >
              {label}
            </Link>
          ))}

          <button
            onClick={() => navigate("/loginpage")}
            className="ml-6 px-6 py-2 rounded-full bg-teal-600 text-white font-semibold hover:bg-teal-700 transition duration-300 shadow-md"
          >
           Log Menu
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center gap-4">
          <button
            onClick={() => navigate("/loginpage")}
            className="px-5 py-2 rounded-full bg-teal-600 text-white font-semibold hover:bg-teal-700 transition duration-300 shadow-md"
          >
       Log Menu
          </button>

          <button
            className="text-gray-900 focus:outline-none"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="lg:hidden bg-white/95 backdrop-blur-md px-6 py-6 border-t border-gray-200 shadow-md">
          <ul className="flex flex-col gap-6 text-center">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                smooth
                duration={400}
                spy
                offset={-60}
                onClick={closeMenu}
                activeClass="text-teal-600 font-semibold"
                className="text-gray-900 text-lg cursor-pointer hover:text-teal-600 transition"
              >
                {label}
              </Link>
            ))}

           
          </ul>
        </nav>
      )}
    </header>
  );
}

export default Navigation;
