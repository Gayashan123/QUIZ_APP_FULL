import React from "react";
import { FaTimes } from "react-icons/fa";

const Login = ({ closeLogin }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md bg-white/30 backdrop-blur-lg rounded-3xl shadow-2xl p-8 transition-all duration-300 ease-in-out border border-white/20">
        
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-white hover:text-gray-200 transition"
          onClick={closeLogin}
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Jeuizz </h1>
          <p className="text-lg text-white/90 mt-2 font-medium">Student Log In</p>
        </div>

        {/* Login Form */}
        <form className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm text-white mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="example@mail.com"
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-white mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div className="flex justify-between items-center text-sm text-white/80">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2 accent-teal-400" />
              Remember me
            </label>
            <a href="#" className="hover:underline text-teal-300">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
