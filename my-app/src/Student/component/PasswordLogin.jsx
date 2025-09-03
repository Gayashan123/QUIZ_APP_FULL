import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { apiurl } from "../../Admin/common/Http";
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const API_ROOT = apiurl.replace(/\/+$/, "") + "/";

const resolveToken = () => {
  try { return JSON.parse(localStorage.getItem("userInfo"))?.token || ""; } catch { return ""; }
};
const makeHeaders = () => {
  const h = new Headers();
  h.set("Accept", "application/json");
  h.set("Content-Type", "application/json");
  const tk = resolveToken();
  if (tk) h.set("Authorization", `Bearer ${tk}`);
  return h;
};
const fetchJSON = async (url, opts = {}) => {
  const res = await fetch(url, { ...opts, headers: makeHeaders() });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); msg = d?.message || d?.error || JSON.stringify(d) || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
};

export default function QuizLogin() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Require login first
  useEffect(() => {
    if (!resolveToken()) {
      toast.info("Please log in first.");
      navigate("/login"); // adjust to your route
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetchJSON(`${API_ROOT}quizzes/${quizId}/enter`, {
        method: "POST",
        body: JSON.stringify({ access_code: password }),
      });
      const token = res?.data?.attempt_token;
      const endAt = res?.data?.end_at;
      if (!token) throw new Error("No attempt token returned");

      sessionStorage.setItem(`attemptToken:${quizId}`, token);
      if (endAt) sessionStorage.setItem(`attemptEndAt:${quizId}`, String(new Date(endAt).getTime()));

      toast.success("Access granted. Good luck!");
      navigate(`/quiz/${quizId}/attempt`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message); // shows "Quiz has not started yet" or "Quiz has ended" or "Invalid access code"
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 sm:p-10 border border-gray-200">
        <div className="flex items-center justify-center gap-3 mb-4">
          <LockClosedIcon className="h-7 w-7 text-blue-500" />
          <h2 className="text-3xl font-semibold text-gray-900">Quiz Login</h2>
        </div>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Enter your quiz password to continue
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 rounded-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm border-gray-200 transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 transition-all"
          >
            {submitting ? "Please wait…" : "Continue"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/studentquiz")}
            className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition"
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
}