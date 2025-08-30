import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Home } from "lucide-react"; // Or keep MUI icons if needed
import TopNav from "../components/TopNav";
import Sidebar from "../components/Sidebar";
import QuizDetailsStep from "../components/QuizDetailsStep";
import AddQuestionsStep from "../components/AddQuestionsStep";
import ReviewStep from "../components/ReviewStep";

const steps = ["Quiz Details", "Add Questions", "Review & Publish"];

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [quiz, setQuiz] = useState({
    title: "",
    subject: "",
    description: "",
    questions: [],
    timeLimit: 30,
    passingScore: 70,
    startDate: "",
    deadline: "",
    pdfFile: null
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ open: false, message: "", severity: "success" }), 5000);
  };

  const handleNext = () => {
    if (activeStep === 0 && (!quiz.title || !quiz.subject)) {
      showSnackbar("Please fill in all required quiz details", "error");
      return;
    }

    if (activeStep === 1 && quiz.questions.length === 0) {
      showSnackbar("Please add at least one question", "error");
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const submitQuiz = async () => {
    if (
      !quiz.title ||
      !quiz.subject ||
      !quiz.timeLimit ||
      !quiz.passingScore ||
      !quiz.startDate ||
      !quiz.deadline ||
      quiz.questions.length === 0
    ) {
      showSnackbar("Please fill all fields and add at least one question", "error");
      return;
    }

    try {
      await new Promise((res) => setTimeout(res, 1000));
      showSnackbar("Quiz published successfully!", "success");
      navigate("/teacher/dashboard");
    } catch {
      showSnackbar("Failed to create quiz. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar if needed */}
      {/* <Sidebar /> */}

      <div className="flex-1 min-h-screen">
        {/* Snackbar */}
        {snackbar.open && (
          <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-md text-white shadow-lg
            ${snackbar.severity === "error" ? "bg-red-500" : "bg-green-500"}`}>
            {snackbar.message}
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl shadow-md p-6 md:p-10 mt-4">
            {/* Home Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => navigate("/home")}
                className="flex items-center border-2 border-gray-300 hover:border-gray-500 text-sm font-semibold rounded-lg px-4 py-2"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </button>
            </div>

            {/* Stepper */}
            <div className="flex justify-between mb-8">
              {steps.map((label, index) => (
                <div
                  key={label}
                  className={`flex-1 text-center text-sm font-semibold transition
                    ${index === activeStep ? "text-indigo-600" : "text-gray-400"}`}
                >
                  <div
                    className={`w-4 h-4 mx-auto rounded-full mb-1
                      ${index <= activeStep ? "bg-indigo-600" : "bg-gray-300"}`}
                  ></div>
                  {label}
                </div>
              ))}
            </div>

            {/* Step Content */}
            {activeStep === 0 && (
              <QuizDetailsStep quiz={quiz} setQuiz={setQuiz} showSnackbar={showSnackbar} />
            )}
            {activeStep === 1 && (
              <AddQuestionsStep quiz={quiz} setQuiz={setQuiz} showSnackbar={showSnackbar} />
            )}
            {activeStep === 2 && <ReviewStep quiz={quiz} />}

            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
              <button
                onClick={handleBack}
                disabled={activeStep === 0}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold
                  disabled:opacity-50 hover:border-gray-500 transition"
              >
                Back
              </button>

              {activeStep === steps.length - 1 ? (
                <button
                  onClick={submitQuiz}
                  className="flex items-center justify-center px-6 py-2 text-white font-semibold rounded-lg
                    bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-600 hover:to-green-500 transition"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Publish Quiz
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 text-white font-semibold rounded-lg
                    bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-700 hover:to-purple-600 transition"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
