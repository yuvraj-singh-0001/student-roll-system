import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const adminLinks = [
  { path: "/admin", label: "Dashboard", icon: "🏠" },
  { path: "/admin/questions", label: "Questions", icon: "📝" },
  { path: "/admin/exam-dashboard", label: "Exam Dashboard", icon: "📊" },
  { path: "/admin/view-students", label: "View Students", icon: "👨‍🎓" },
  { path: "/admin/add-student", label: "Add Student", icon: "➕" },
  { path: "/admin/send-notification", label: "Notifications", icon: "📨" },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <aside
      className={`
        h-screen sticky top-0
        bg-white/95 text-gray-800
        border-r border-[#FFE6A3]
        flex flex-col
        shadow-lg
        transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]
        ${sidebarOpen ? "w-56" : "w-14"}
      `}
    >
      {/* Top brand + toggle */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-[#FFE6A3] bg-[#FFF9E6]/80 backdrop-blur-sm">
        <div
          className={`
            flex items-center gap-2 overflow-hidden transition-all duration-300
            ${sidebarOpen ? "opacity-100" : "opacity-0 w-0"}
          `}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] flex items-center justify-center shadow">
            <span className="text-xs font-bold text-gray-900">A</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              Admin Panel
            </div>
            <div className="text-[11px] text-gray-500">Control Center</div>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen((p) => !p)}
          className="p-1.5 rounded-lg hover:bg-[#FFF3C4] text-gray-600 transition-colors"
        >
          {sidebarOpen ? "«" : "»"}
        </button>
      </div>

      {/* Nav links */}
      <nav className="mt-2 px-2 space-y-1 flex-1 overflow-y-auto">
        {adminLinks.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`group w-full flex items-center gap-3 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all duration-200
                ${
                  isActive
                    ? "bg-gradient-to-r from-[#FFEBB5] to-[#FFDF85] text-gray-900 shadow-sm"
                    : "text-gray-600 hover:bg-[#FFF3C4] hover:text-gray-900"
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
      <div className="border-t border-[#FFE6A3] px-2 py-2 bg-[#FFF9E6]/70">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-2 py-1.5 text-[11px] font-medium rounded-md hover:bg-[#FFF3C4] hover:text-gray-900 text-gray-600 transition-colors"
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
    </aside>
  );
}
