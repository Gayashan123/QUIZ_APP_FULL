import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import { Sun, Moon, Bell, Save } from "lucide-react";

export default function TeacherSettings() {
  const [profile, setProfile] = useState({
    name: "Mr. Smith",
    email: "mr.smith@school.edu",
    password: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
    sms: false,
  });

  const [quizDefaults, setQuizDefaults] = useState({
    gradingScheme: "percentage",
    defaultTimeLimit: 30,
    randomOrder: false,
  });

  const [theme, setTheme] = useState("light");

  // Handlers omitted for brevity; implement update logic with backend

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
      <Sidebar teacherName={profile.name} />

      <main className="flex-1 flex flex-col overflow-auto">
        <TopNav notifications={[]} />

        <div className="p-6 md:p-8 w-full max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">Settings</h1>

          {/* Profile */}
          <section className="mb-8 bg-white shadow rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Password</label>
                <input
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  type="password"
                  placeholder="Change password"
                  value={profile.password}
                  onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                />
              </div>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium mt-3"
              >
                <Save className="w-5 h-5" /> Save Profile
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className="mb-8 bg-white shadow rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox text-indigo-600"
                  checked={notifications.email}
                  onChange={() =>
                    setNotifications((n) => ({ ...n, email: !n.email }))
                  }
                />
                Email
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox text-indigo-600"
                  checked={notifications.inApp}
                  onChange={() =>
                    setNotifications((n) => ({ ...n, inApp: !n.inApp }))
                  }
                />
                In-App
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox text-indigo-600"
                  checked={notifications.sms}
                  onChange={() =>
                    setNotifications((n) => ({ ...n, sms: !n.sms }))
                  }
                />
                SMS
              </label>
            </div>
          </section>

          {/* Quiz Defaults */}
          <section className="mb-8 bg-white shadow rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Default Quiz Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Grading Scheme</label>
                <select
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  value={quizDefaults.gradingScheme}
                  onChange={(e) =>
                    setQuizDefaults({ ...quizDefaults, gradingScheme: e.target.value })
                  }
                >
                  <option value="percentage">Percentage</option>
                  <option value="points">Points</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Default Time Limit (minutes)
                </label>
                <input
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  type="number"
                  min={5}
                  max={180}
                  value={quizDefaults.defaultTimeLimit}
                  onChange={(e) =>
                    setQuizDefaults({
                      ...quizDefaults,
                      defaultTimeLimit: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    className="form-checkbox text-indigo-600"
                    checked={quizDefaults.randomOrder}
                    onChange={() =>
                      setQuizDefaults((q) => ({
                        ...q,
                        randomOrder: !q.randomOrder,
                      }))
                    }
                  />
                  Randomize question order by default
                </label>
              </div>
            </div>
          </section>

          {/* Theme / Mode */}
          <section className="mb-8 bg-white shadow rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Theme</h2>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="theme"
                  className="form-radio text-indigo-600"
                  checked={theme === "light"}
                  onChange={() => setTheme("light")}
                />
                <Sun className="w-5 h-5 text-yellow-400" /> Light
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="theme"
                  className="form-radio text-indigo-600"
                  checked={theme === "dark"}
                  onChange={() => setTheme("dark")}
                />
                <Moon className="w-5 h-5 text-gray-700" /> Dark
              </label>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
