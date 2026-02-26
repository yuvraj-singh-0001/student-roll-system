// src/components/Student-layout/StudentSidebar.jsx
import { useState, useEffect } from "react";
import { FaTachometerAlt, FaClipboardList, FaFileAlt } from "react-icons/fa";

const PROFILE_KEYS = {
  name: "studentProfileName",
  avatar: "studentProfileAvatar",
};

const readSidebarProfile = () => {
  if (typeof window === "undefined") {
    return { name: "Student", avatar: "" };
  }
  const name =
    localStorage.getItem(PROFILE_KEYS.name) ||
    localStorage.getItem("studentName") ||
    "Student";
  const avatar = localStorage.getItem(PROFILE_KEYS.avatar) || "";
  return { name, avatar };
};

const getInitial = (name) => {
  const text = String(name || "").trim();
  return text ? text.charAt(0).toUpperCase() : "S";
};

const studentMenu = [
  { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt />, path: "/student" },
  { id: "exam", label: "Take Exam", icon: <FaClipboardList />, path: "/student/exam" },
  { id: "results", label: "Exam Results", icon: <FaFileAlt />, path: "/student/result" },
  // { id: "video", label: "Video Upload", icon: <FaVideo />, path: "/student/video-upload" },
  // { id: "performance", label: "Performance", icon: <FaChartLine />, path: "/student/performance" },
  // { id: "register", label: "Exam Register", icon: <FaFileAlt />, path: "/student/register" },
];

export default function StudentSidebar({
  sidebarOpen,
  setSidebarOpen,
  currentPath,
  onNavigate,
}) {
  const [profile, setProfile] = useState(() => readSidebarProfile());

  useEffect(() => {
    setProfile(readSidebarProfile());
  }, []);

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
        className={`fixed inset-y-0 left-0 z-40 h-screen
        bg-white/95 text-gray-800
        border-r border-[#FFE6A3]
        flex flex-col shadow-lg
        transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]
        ${sidebarOpen ? "w-64" : "w-16"}
        hidden sm:flex`}
      >
        {/* Top brand + toggle */}
        <div className="flex items-center justify-between h-16 px-3 border-b border-[#FFE6A3] bg-[#FFF9E6]/80 backdrop-blur-sm">
          <div
            className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${
              sidebarOpen ? "opacity-100" : "opacity-0 w-0"
            }`}
          >
            <p className="text-sm font-semibold text-gray-900">
              Student Dashboard
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-[#FFF3C4] text-gray-600 transition-colors"
          >
            {sidebarOpen ? "<" : ">"}
          </button>
        </div>

        {/* Nav items */}
        <nav className="mt-3 px-2 space-y-1 flex-1 overflow-y-auto">
          {studentMenu.map((item) => {
            const active =
              item.path === "/student"
                ? currentPath === "/student" || currentPath === "/student/"
                : currentPath.startsWith(item.path);
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`group w-full flex items-center gap-3 px-2.5 py-2 text-xs font-medium rounded-md transition-all duration-200
                  ${
                    active
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
                  className={`whitespace-nowrap transition-all duration-300 ${
                    sidebarOpen ? "opacity-100" : "opacity-0 w-0"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[#FFE6A3] px-2 py-2 bg-[#FFF9E6]/70">
          <button
            onClick={() => onNavigate("/")}
            className="w-full flex items-center gap-3 px-2.5 py-2 text-xs font-medium rounded-md hover:bg-[#FFF3C4] hover:text-gray-900 text-gray-600 transition-colors"
          >
            <div className="w-6 flex justify-center">
              <span>{"<"}</span>
            </div>
            <span
              className={`whitespace-nowrap transition-all duration-300 ${
                sidebarOpen ? "opacity-100" : "opacity-0 w-0"
              }`}
            >
              Back to Home
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

