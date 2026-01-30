import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [activeIndex, setActiveIndex] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      label: "Total Students",
      value: "1,248",
      change: "+12%",
      icon: "👥",
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Exams Created",
      value: "48",
      change: "+5",
      icon: "📋",
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Avg Score",
      value: "78.5%",
      change: "+3.2%",
      icon: "📊",
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Active Sessions",
      value: "12",
      change: "Live",
      icon: "⚡",
      color: "from-orange-500 to-red-500",
    },
  ];

  const quickLinks = [
    {
      path: "/admin/questions",
      label: "Manage Questions",
      desc: "Create, edit & organize questions",
      icon: "📝",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      path: "/admin/exam-dashboard",
      label: "Exam Analytics",
      desc: "Detailed reports & insights",
      icon: "📈",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      path: "/admin/view-students",
      label: "Student Management",
      desc: "View & manage all students",
      icon: "👨‍🎓",
      color: "bg-gradient-to-br from-green-500 to-green-600",
    },
    {
      path: "/admin/add-student",
      label: "Add Student",
      desc: "Register new student account",
      icon: "➕",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
    {
      path: "/admin/send-notification",
      label: "Send Notification",
      desc: "Email & push notifications",
      icon: "📨",
      color: "bg-gradient-to-br from-pink-500 to-rose-500",
    },
    {
      path: "/admin/settings",
      label: "System Settings",
      desc: "Platform configuration",
      icon: "⚙️",
      color: "bg-gradient-to-br from-gray-600 to-gray-800",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: "John Doe",
      action: "completed exam",
      time: "2 min ago",
      exam: "Mathematics Final",
      status: "completed",
      score: "85%",
    },
    {
      id: 2,
      user: "Sarah Smith",
      action: "registered",
      time: "15 min ago",
      exam: "New Student",
      status: "registered",
      score: "-",
    },
    {
      id: 3,
      user: "Mike Johnson",
      action: "scored 92% in",
      time: "1 hour ago",
      exam: "Physics Test",
      status: "scored",
      score: "92%",
    },
    {
      id: 4,
      user: "Emma Wilson",
      action: "started exam",
      time: "2 hours ago",
      exam: "Chemistry Quiz",
      status: "in-progress",
      score: "-",
    },
    {
      id: 5,
      user: "David Brown",
      action: "failed exam",
      time: "3 hours ago",
      exam: "Biology Test",
      status: "failed",
      score: "42%",
    },
    {
      id: 6,
      user: "Lisa Taylor",
      action: "updated profile",
      time: "4 hours ago",
      exam: "Profile Update",
      status: "updated",
      score: "-",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "scored":
        return "bg-emerald-100 text-emerald-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700 animate-pulse";
      case "failed":
        return "bg-red-100 text-red-700";
      case "registered":
        return "bg-purple-100 text-purple-700";
      case "updated":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "✅";
      case "scored":
        return "🎯";
      case "in-progress":
        return "⏳";
      case "failed":
        return "❌";
      case "registered":
        return "👤";
      case "updated":
        return "✏️";
      default:
        return "📝";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="group flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                  <span className="text-lg group-hover:-translate-x-0.5 transition-transform">
                    ←
                  </span>
                  <span>Back to Home</span>
                </button>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">
                      Admin Dashboard
                    </h1>
                    <p className="text-xs text-gray-500">
                      Welcome back, Administrator
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Profile
                  </span>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl shadow-lg">
                  <div className="text-sm font-medium">
                    {time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards - Made Smaller */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className="text-lg text-white">{stat.icon}</span>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      stat.label === "Active Sessions"
                        ? "bg-red-100 text-red-700 animate-pulse"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></div>
              </div>
            ))}
          </div>

          {/* Quick Actions - Full Width Above Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Quick Actions
                </h2>
                <span className="text-sm text-gray-500">
                  {quickLinks.length} actions available
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickLinks.map((link, index) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    className={`group relative p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 text-left transition-all duration-300 hover:border-transparent hover:shadow-xl hover:-translate-y-1 ${
                      activeIndex === index ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <span className="text-xl text-white">
                          {link.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {link.label}
                        </h3>
                        <p className="text-sm text-gray-500">{link.desc}</p>
                      </div>
                      <span className="text-gray-400 group-hover:text-gray-700 transform group-hover:translate-x-2 transition-all duration-300">
                        →
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area - Full Width Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Recent Activities (Takes 2/3 width) */}
            <div className="lg:w-2/3">
              {/* Recent Activities - Full Width with 3 Rows */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Recent Activities
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Real-time student activities monitoring
                      </p>
                    </div>
                    <button className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
                      View All →
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <span>USER</span>
                            <span className="text-gray-400 text-xs">↓</span>
                          </div>
                        </th>
                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          ACTIVITY
                        </th>
                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          EXAM/DETAILS
                        </th>
                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          STATUS
                        </th>
                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          SCORE
                        </th>
                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          TIME
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentActivities.slice(0, 3).map((activity, index) => (
                        <tr
                          key={activity.id}
                          onMouseEnter={() => setHoveredRow(activity.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          className={`group transition-all duration-300 animate-fade-in ${
                            hoveredRow === activity.id
                              ? "bg-gradient-to-r from-blue-50/50 to-transparent transform scale-[1.002]"
                              : "hover:bg-gray-50"
                          }`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm transition-transform duration-300 ${
                                  hoveredRow === activity.id ? "scale-110" : ""
                                }`}
                              >
                                <span className="text-xs">👤</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {activity.user}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-5 h-5 rounded flex items-center justify-center text-xs ${getStatusColor(activity.status)}`}
                              >
                                {getStatusIcon(activity.status)}
                              </span>
                              <span className="text-sm text-gray-700">
                                {activity.action}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-4">
                            <div className="text-sm font-medium text-gray-900">
                              {activity.exam}
                            </div>
                          </td>
                          <td className="py-2 px-4">
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}
                            >
                              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <div
                              className={`text-sm font-medium ${
                                activity.score !== "-"
                                  ? activity.score >= "90%"
                                    ? "text-emerald-600"
                                    : activity.score >= "70%"
                                      ? "text-green-600"
                                      : activity.score >= "50%"
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {activity.score}
                            </div>
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-500">
                                {activity.time}
                              </span>
                              <span className="text-gray-300 group-hover:text-gray-400 transition-all duration-300 transform group-hover:translate-x-0.5">
                                →
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-gray-100 p-3 bg-gray-50/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Showing {recentActivities.slice(0, 3).length} of 1248
                      activities
                    </span>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all duration-300 hover:-translate-y-0.5">
                        ←
                      </button>
                      <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-700 font-medium">
                        1
                      </span>
                      <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all duration-300 hover:-translate-y-0.5">
                        →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Side Panel (Takes 1/3 width) */}
            <div className="lg:w-1/3 space-y-8">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  System Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Server Load</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: "65%" }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        65%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">
                        Connected
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Storage</span>
                    <span className="text-sm font-medium text-gray-900">
                      2.4 GB / 10 GB
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium text-gray-900">
                      99.8%
                    </span>
                  </div>
                </div>
              </div>

              {/* Emergency Actions */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Emergency Actions
                </h3>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-md">
                    ⚠️ Emergency Lockdown
                  </button>
                  <button className="w-full p-3 bg-white border border-orange-200 text-orange-600 font-medium rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-md">
                    📧 Broadcast Alert
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    Admin Dashboard v2.0
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>
                    Last updated: Today,{" "}
                    {time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300">
                  Help Center
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300">
                  Documentation
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300">
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}