import { Outlet } from "react-router-dom";
import AdminSidebar from "../adminlayout/sidebar";
import AdminNavbar from "../adminlayout/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="h-screen overflow-hidden flex bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4]">
      {/* Fixed / sticky sidebar */}
      <AdminSidebar />

      {/* Right side: header + scrollable main + footer */}
      <div className="flex-1 flex flex-col relative">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FFE6A3] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-[#FFEBD0] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        </div>

        {/* Scrollable content container */}
        <div className="relative z-10 flex flex-col h-screen">
          <AdminNavbar />

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
              <Outlet />
            </div>
          </main>

          <footer className="border-t border-[#FFE6A3] bg-white/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] flex items-center justify-center">
                    <span className="text-gray-900 font-bold text-xs">A</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Admin Console v2.0
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>© {new Date().getFullYear()} The True Topper</span>
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
