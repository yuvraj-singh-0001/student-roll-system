// src/components/Student-layout/StudentSidebar.jsx
import {
  FaTachometerAlt,
  FaClipboardList,
  FaFileAlt,
  FaVideo,
  FaChartLine,
} from "react-icons/fa";

const studentMenu = [
  { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt />, path: "/student" },
  { id: "exam", label: "Give Exam", icon: <FaClipboardList />, path: "/student/exam" },
  { id: "results", label: "Results", icon: <FaFileAlt />, path: "/student/result" },
  { id: "video", label: "Video Upload", icon: <FaVideo />, path: "/student/video-upload" },
  { id: "performance", label: "Performance", icon: <FaChartLine />, path: "/student/performance" },
  { id: "register", label: "Exam Register", icon: <FaFileAlt />, path: "/student/register" },
];

export default function StudentSidebar({
  sidebarOpen,
  setSidebarOpen,
  currentPath,
  onNavigate,
}) {
  const isCollapsed = !sidebarOpen;

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40
        bg-gradient-to-b from-[#FFA600] via-[#FF8A3C] to-[#D95A00]
        text-white shadow-2xl border-r border-white/10
        backdrop-blur-xl bg-opacity-95
        transition-all duration-300
        ${sidebarOpen ? "w-64" : "w-16"}
        hidden sm:flex flex-col`}
      >
        {/* Header + collapse toggle */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-xs font-bold">
              ST
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/80">
                  NSO Student
                </p>
                <p className="text-sm font-semibold">Student Portal</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs hover:bg-white/20"
          >
            {isCollapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scroll">
          {studentMenu.map((item) => {
            const active = currentPath.startsWith(item.path);
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center rounded-lg px-2 ${
                  isCollapsed ? "justify-center py-2.5" : "justify-start py-2.5"
                } text-sm transition-all duration-200
                ${
                  active
                    ? "bg-white/95 text-[#D95A00] shadow-sm"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {!isCollapsed && (
                  <span className="ml-2.5 truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-3 py-3 text-center text-[11px] text-white/70 border-t border-white/10">
          NSO Student Portal • © 2026
        </div>
      </aside>
    </>
  );
}
