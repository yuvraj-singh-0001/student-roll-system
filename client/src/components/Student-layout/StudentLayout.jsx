// src/Student-layout/StudentLayout.jsx
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import StudentNavbar from "./StudentNavbar";

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4]">
      <StudentSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
      />

      <div className={`min-h-screen flex flex-col transition-all duration-300 sm:ml-16 ${sidebarOpen ? "sm:ml-64" : "sm:ml-16"}`}>
        <StudentNavbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="border-t border-[#FFE6A3] bg-white/80 py-3 text-center text-[11px] text-gray-600">
          TTT Student Portal (c) 2026
        </footer>
      </div>
    </div>
  );
}


