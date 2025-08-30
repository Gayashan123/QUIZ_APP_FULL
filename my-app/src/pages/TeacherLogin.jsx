import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LockClosedIcon,
  EnvelopeIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AuthContext } from "../context/Auth";

const TeacherLogin = ({ closeLogin }) => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // 🔹 States
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Input change handler
  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // 🔹 Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/teauthenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.username,
          password: credentials.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Login failed");
      }

      // 🔹 Save user in AuthContext
      const userData = { email: credentials.username, token: result.token || null };
      login(userData);

      // 🔹 Remember Me feature
      if (rememberMe) {
        localStorage.setItem("userInfo", JSON.stringify(userData));
      } 

      // ✅ Redirect after success
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 sm:p-10 border border-gray-200">
      {/* Close Button */}
      <button
        onClick={closeLogin}
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition"
      >
        <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
      </button>

      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <UserIcon className="h-7 w-7 text-blue-500" />
        <h2 className="text-3xl font-semibold text-gray-900">Teacher Login</h2>
      </div>
      <p className="text-center text-gray-500 mb-6 text-sm">
        Enter your credentials to access your dashboard
      </p>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
        Email 
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="username"
              id="username"
              value={credentials.username}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 rounded-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm border-gray-200 transition-all"
              placeholder="Your email"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={credentials.password}
              onChange={handleChange}
              className="block w-full pl-10 pr-10 py-2 rounded-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm border-gray-200 transition-all"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Help */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-400"
              disabled={isLoading}
            />
            Remember me
          </label>
          <div className="flex items-center gap-1 text-blue-500 cursor-pointer hover:text-blue-700">
            <QuestionMarkCircleIcon className="h-5 w-5" />
            <span>Help: +94 752 069 762</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing in...
            </div>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
};

export default TeacherLogin;
