// Home.jsx
import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Quiz from "../assets/Quiz1.jpg";
import { FaSignInAlt, FaUserShield, FaChalkboardTeacher, FaHome } from "react-icons/fa";

// Lazy load login forms
const AdminLogin = lazy(() => import("./AdminLogin"));
const TeacherLogin = lazy(() => import("./TeacherLogin"));
const StudentLogin = lazy(() => import("./StudentLogin"));

// Animation variants
const buttonVariants = { hover: { scale: 1.05 }, tap: { scale: 0.95 } };
const modalBackdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 0.5 }, exit: { opacity: 0 } };
const modalVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 250, damping: 25 } },
  exit: { opacity: 0, y: 40, scale: 0.95, transition: { duration: 0.2 } },
};

// Simple fallback component for lazy-loaded modals
const ModalFallback = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <p className="text-gray-700">Loading...</p>
  </div>
);

const Home = () => {
  const navigate = useNavigate();

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Close modals on ESC
  const handleEsc = useCallback((e) => {
    if (e.key === "Escape") {
      setShowAdminModal(false);
      setShowTeacherModal(false);
      setShowStudentModal(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleEsc]);

  return (
    <>
      

      {/* Main Home UI */}
      <main
        className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
        style={{ backgroundImage: `url(${Quiz})` }}
      >
        <section
          className="bg-white/60 backdrop-blur-lg p-8 rounded-2xl shadow-2xl text-center max-w-md w-full"
          aria-label="Welcome Section"
        >
          <h1 className="text-4xl font-semibold text-gray-900 mb-3 tracking-tight">
            Welcome to <span className="text-blue-600">JuizQuiz</span>
          </h1>
          <p className="text-gray-700 mb-6 text-base font-light">
            Challenge your mind. Play smart. Learn fast.
          </p>

          <div className="flex flex-col gap-4">
            <motion.button
              onClick={() => setShowAdminModal(true)}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-2xl shadow-sm"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label="Admin Login"
            >
              <FaUserShield /> Admin Login
            </motion.button>

            <motion.button
              onClick={() => setShowTeacherModal(true)}
              className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-2xl shadow-sm"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label="Teacher Login"
            >
              <FaChalkboardTeacher /> Teacher Login
            </motion.button>

            <motion.button
              onClick={() => setShowStudentModal(true)}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-2xl shadow-sm"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label="Student Login"
            >
              <FaSignInAlt /> Student Login
            </motion.button>
          </div>
        </section>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAdminModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black z-40"
              variants={modalBackdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowAdminModal(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <Suspense fallback={<ModalFallback />}>
                <AdminLogin closeLogin={() => setShowAdminModal(false)} />
              </Suspense>
            </motion.div>
          </>
        )}

        {showTeacherModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black z-40"
              variants={modalBackdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowTeacherModal(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <Suspense fallback={<ModalFallback />}>
                <TeacherLogin closeLogin={() => setShowTeacherModal(false)} />
              </Suspense>
            </motion.div>
          </>
        )}

        {showStudentModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black z-40"
              variants={modalBackdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowStudentModal(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <Suspense fallback={<ModalFallback />}>
                <StudentLogin closeLogin={() => setShowStudentModal(false)} />
              </Suspense>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Home;
