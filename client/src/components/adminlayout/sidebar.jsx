import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const adminLinks = [
  { path: "/admin", label: "Dashboard", icon: "🏠" },
  { path: "/admin/questions", label: "Questions", icon: "📝" },
  { path: "/admin/exam-dashboard", label: "Exam Dashboard", icon: "📊" },
  { path: "/admin/view-students", label: "View Students", icon: "👨‍🎓" },
  { path: "/admin/add-student", label: "Add Student", icon: "➕" },
  { path: "/admin/send-notification", label: "Notifications", icon: "📨" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden flex">
      {/* Sidebar */}
      <div
        className={`
          relative z-20
          bg-gray-900 text-gray-100
          flex flex-col
          transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]
          ${sidebarOpen ? "w-64" : "w-16"}
        `}
      >
        {/* Top brand + toggle */}
        <div className="flex items-center justify-between h-16 px-3 border-b border-gray-800">
          <div
            className={`
              flex items-center gap-2 overflow-hidden transition-all duration-300
              ${sidebarOpen ? "opacity-100" : "opacity-0 w-0"}
            `}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center shadow">
              <span className="text-xs font-bold text-gray-900">A</span>
            </div>
            <div>
              <div className="text-sm font-semibold">Admin Panel</div>
              <div className="text-[11px] text-gray-400">Control Center</div>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-300 transition-colors"
          >
            {sidebarOpen ? "«" : "»"}
          </button>
        </div>

        {/* Nav links */}
        <nav className="mt-3 px-2 space-y-1 flex-1 overflow-y-auto">
          {adminLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`group w-full flex items-center gap-3 px-2.5 py-2 text-xs font-medium rounded-md transition-all duration-200
                  ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
              >
                <div className="w-6 flex justify-center">
                  <span className="text-sm group-hover:scale-110 transform transition-transform duration-200">
                    {item.icon}
                  </span>
                </div>
                <span
                  className={`
                    whitespace-nowrap transition-all duration-300
                    ${sidebarOpen ? "opacity-100" : "opacity-0 w-0"}
                  `}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom – back to home */}
        <div className="border-t border-gray-800 px-2 py-2">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-2.5 py-2 text-xs font-medium rounded-md hover:bg-gray-800 hover:text-white text-gray-300 transition-colors"
          >
            <div className="w-6 flex justify-center">
              <span>↩</span>
            </div>
            <span
              className={`
                whitespace-nowrap transition-all duration-300
                ${sidebarOpen ? "opacity-100" : "opacity-0 w-0"}
              `}
            >
              Back to Home
            </span>
          </button>
        </div>
      </div>

      {/* Right side – common background + header + footer + Outlet */}
      <div className="flex-1 relative z-10">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">
                      Admin Area
                    </h1>
                    <p className="text-xs text-gray-500">
                      Manage exams, students & system
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">
                      System Online
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

          {/* Page content – yaha har admin page render hoga */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">A</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Admin Console v2.0
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    Updated:{" "}
                    {time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="hidden md:inline-block">•</span>
                  <button className="hover:text-gray-800 transition-colors">
                    Help
                  </button>
                  <button className="hover:text-gray-800 transition-colors">
                    Docs
                  </button>
                  <button className="hover:text-gray-800 transition-colors">
                    Report
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
