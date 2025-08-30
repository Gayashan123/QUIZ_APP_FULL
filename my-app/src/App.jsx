import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import Navigation from "./components/Navigation";
import QuizPage from "./pages/LeaderBoared";
import UserDashboard from "./pages/QuizDashboared";

import Teacher from "./Teacher/pages/Home";
import Admin from "./Admin/pages/Home";
import Student from "./Student/pages/Home";
import CreateQuiz from "./Teacher/pages/CreateQuiz";
import View from "./Teacher/pages/ViewAnalytics";
import ManageStude from "./Teacher/pages/ManageStude";
import GradeSub from "./Teacher/pages/GradeSub";
import SettingPage from "./Teacher/pages/SettingPage";

import CreateSt from "./Admin/pages/CreateStudent";
import CreateTe from "./Admin/pages/CreateTeacher";
import CreateFu from "./Admin/pages/CreateFaculty";
import CreateSu from "./Admin/pages/CreateSubject";
import RequireAuth from "./pages/RequireAuth";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Route with main sections */}
        <Route
          path="/"
          element={
            <>
              <Navigation />
              <Header />
              <About />
              <Contact />
              <Footer />
            </>
          }
        />

        {/* Login page */}
        <Route path="/loginpage" element={<LoginPage />} />

        {/* Quiz leaderboard */}
        <Route path="/quizpage" element={<QuizPage />} />

        {/* User dashboard */}
        <Route path="/user" element={<UserDashboard />} />

        {/* Teacher routes */}
        <Route path="/home" element={
          <RequireAuth>
          <Teacher />
          </RequireAuth>
          } />
        <Route path="/createquiz" element={<CreateQuiz />} />
        <Route path="/view" element={<View />} />
        <Route path="/manage" element={<ManageStude />} />
        <Route path="/grade" element={<GradeSub />} />
        <Route path="/settings" element={<SettingPage />} />

        {/* Admin routes */}

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <Admin />
            </RequireAuth>
          }
        />

        <Route
          path="/createst"
          element={
            <RequireAuth>
              <CreateSt />
            </RequireAuth>
          }
        />
        <Route
          path="/createte"
          element={
            <RequireAuth>
              <CreateTe />
            </RequireAuth>
          }
        />
        <Route
          path="/createsu"
          element={
            <RequireAuth>
              <CreateSu />
            </RequireAuth>
          }
        />
        <Route
          path="/createfu"
          element={
            <RequireAuth>
              <CreateFu />
            </RequireAuth>
          }
        />

        {/* Student route */}
        <Route path="/student" element={<Student />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
