import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: "Total Students", value: "1,248", change: "+12%", icon: "👥", color: "from-blue-500 to-cyan-500" },
    { label: "Exams Created", value: "48", change: "+5", icon: "📋", color: "from-purple-500 to-pink-500" },
    { label: "Avg Score", value: "78.5%", change: "+3.2%", icon: "📊", color: "from-green-500 to-emerald-500" },
    { label: "Active Sessions", value: "12", change: "Live", icon: "⚡", color: "from-orange-500 to-red-500" }
  ];

  const quickLinks = [
    { path: "/admin/questions", label: "Manage Questions", desc: "Create, edit & organize questions", icon: "📝", color: "bg-gradient-to-br from-blue-500 to-blue-600" },
    { path: "/admin/exam-dashboard", label: "Exam Analytics", desc: "Detailed reports & insights", icon: "📈", color: "bg-gradient-to-br from-purple-500 to-purple-600" },
    { path: "/admin/view-students", label: "Student Management", desc: "View & manage all students", icon: "👨‍🎓", color: "bg-gradient-to-br from-green-500 to-green-600" },
    { path: "/admin/add-student", label: "Add Student", desc: "Register new student account", icon: "➕", color: "bg-gradient-to-br from-orange-500 to-orange-600" },
    { path: "/admin/send-notification", label: "Send Notification", desc: "Email & push notifications", icon: "📨", color: "bg-gradient-to-br from-pink-500 to-rose-500" },
    { path: "/admin/settings", label: "System Settings", desc: "Platform configuration", icon: "⚙️", color: "bg-gradient-to-br from-gray-600 to-gray-800" }
  ];

  const recentActivities = [
    { user: "John Doe", action: "completed exam", time: "2 min ago", exam: "Mathematics Final" },
    { user: "Sarah Smith", action: "registered", time: "15 min ago", exam: "New Student" },
    { user: "Mike Johnson", action: "scored 92% in", time: "1 hour ago", exam: "Physics Test" },
    { user: "Emma Wilson", action: "started exam", time: "2 hours ago", exam: "Chemistry Quiz" }
  ];

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
                  <span className="text-lg group-hover:-translate-x-0.5 transition-transform">←</span>
                  <span>Back to Home</span>
                </button>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-xs text-gray-500">Welcome back, Administrator</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">System Online</span>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl shadow-lg">
                  <div className="text-sm font-medium">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-xl text-white">{stat.icon}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    stat.label === "Active Sessions" 
                      ? "bg-red-100 text-red-700 animate-pulse"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                    <span className="text-sm text-gray-500">{quickLinks.length} actions available</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {quickLinks.map((link, index) => (
                      <button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        className={`group relative p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 text-left transition-all duration-300 hover:border-transparent hover:shadow-xl hover:-translate-y-1 ${
                          activeIndex === index ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <span className="text-xl text-white">{link.icon}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{link.label}</h3>
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

              {/* Recent Activities */}
              <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
                  <p className="text-sm text-gray-500 mt-1">Real-time student activities</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {recentActivities.map((activity, index) => (
                    <div 
                      key={index}
                      className="p-4 hover:bg-gray-50 transition-colors duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-gray-600">👤</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{activity.user}</div>
                            <div className="text-sm text-gray-500">
                              {activity.action} <span className="font-medium">{activity.exam}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-8">
              {/* Upcoming Exams */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <span className="text-xl text-white">📅</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Upcoming Exams</h3>
                      <p className="text-sm text-gray-300">Next 7 days</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { name: "Physics Final", date: "Tomorrow", students: 124 },
                      { name: "Chemistry Quiz", date: "Dec 15", students: 89 },
                      { name: "Mathematics Test", date: "Dec 16", students: 156 }
                    ].map((exam, index) => (
                      <div 
                        key={index}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300 group cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">{exam.name}</h4>
                          <span className="px-2 py-1 text-xs font-medium bg-white/20 text-white rounded-lg">
                            {exam.date}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">
                            👥 {exam.students} students
                          </span>
                          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all duration-300 hover:scale-[1.02]">
                    View All Schedules
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">System Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Server Load</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">65%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">Connected</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Storage</span>
                    <span className="text-sm font-medium text-gray-900">2.4 GB / 10 GB</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium text-gray-900">99.8%</span>
                  </div>
                </div>
              </div>

              {/* Emergency Actions */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Actions</h3>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-300 flex items-center justify-center gap-2">
                    ⚠️ Emergency Lockdown
                  </button>
                  <button className="w-full p-3 bg-white border border-orange-200 text-orange-600 font-medium rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 flex items-center justify-center gap-2">
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
                  <span className="font-medium text-gray-900">Admin Dashboard v2.0</span>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>Last updated: Today, {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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