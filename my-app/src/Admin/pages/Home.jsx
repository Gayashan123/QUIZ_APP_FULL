// components/admin/AdminDashboard.jsx
import React from "react";
import {
  FaUsers, FaChalkboardTeacher, FaClipboardList, FaDatabase, FaShieldAlt, FaCog, FaPlus, FaUserCog
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopNav";
import AdminStatCard from "../components/StatCard";
import SystemMetric from "../components/PerformanceMetric";
import AdminActionButton from "../components/ActionButton";
import ActivityItem from "../components/ActivityItem";
import ApprovalItem from "../components/ApprovalItem";

const adminData = {
  adminName: "Admin",
  totalUsers: 1243,
  totalTeachers: 42,
  activeQuizzes: 86,
  systemStatus: {
    storage: "78%",
    uptime: "99.9%",
    lastBackup: "Yesterday"
  },
  recentActivity: [
    { id: 1, action: "Added new teacher", user: "Sarah Johnson", time: "2h ago" },
    { id: 2, action: "Updated system settings", user: "System", time: "5h ago" },
    { id: 3, action: "Reset password", user: "Michael Brown", time: "1d ago" }
  ],
  pendingApprovals: [
    { id: 1, type: "Teacher", name: "Dr. Emily Wilson", requested: "2 days ago" },
    { id: 2, type: "Quiz", name: "Advanced Calculus", requested: "1 day ago" }
  ]
};

export default function AdminDashboard() {
  const { adminName, totalUsers, totalTeachers, activeQuizzes, systemStatus, recentActivity, pendingApprovals } = adminData;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex">
      <Sidebar adminName={adminName} />
      <main className="flex-1 overflow-auto">
        <TopBar />
        <div className="p-6 md:p-8">
          {/* Welcome */}
          <section className="mb-8">
            <h1 className="text-3xl font-bold mb-2">System Overview</h1>
            <p className="text-gray-600">Welcome back, {adminName}. Here's what's happening with your platform.</p>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AdminStatCard title="Total Users" value={totalUsers} change="+24 this week" icon={<FaUsers />} color="bg-blue-600" />
            <AdminStatCard title="Teachers" value={totalTeachers} change="+2 this week" icon={<FaChalkboardTeacher />} color="bg-purple-600" />
            <AdminStatCard title="Active Quizzes" value={activeQuizzes} change="12 ongoing" icon={<FaClipboardList />} color="bg-green-600" />
          </section>

          {/* System Status + Actions */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">System Status</h2>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View details</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SystemMetric label="Storage" value={systemStatus.storage} progress={78} color="bg-blue-600" />
                <SystemMetric label="Uptime" value={systemStatus.uptime} progress={99.9} color="bg-green-600" />
                <SystemMetric label="Last Backup" value={systemStatus.lastBackup} progress={100} color="bg-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <AdminActionButton icon={<FaUserCog className="text-blue-600" />} label="Add New Admin" />
                <AdminActionButton icon={<FaPlus className="text-green-600" />} label="Create Announcement" />
                <AdminActionButton icon={<FaDatabase className="text-purple-600" />} label="Run Backup" />
                <AdminActionButton icon={<FaShieldAlt className="text-red-600" />} label="Security Scan" />
              </div>
            </div>
          </section>

          {/* Activity & Approvals */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View all</button>
              </div>
              <div className="space-y-4">
                {recentActivity.map(activity => <ActivityItem key={activity.id} activity={activity} />)}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Pending Approvals</h2>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  {pendingApprovals.length} pending
                </span>
              </div>
              <div className="space-y-4">
                {pendingApprovals.map(approval => <ApprovalItem key={approval.id} approval={approval} />)}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
