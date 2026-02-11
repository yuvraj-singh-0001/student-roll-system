// src/Student-layout/StudentNavbar.jsx
import { useState, useEffect } from "react";

export default function StudentNavbar({ onToggleSidebar }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#FEECD5]/90 backdrop-blur-xl border-b border-[#FFE6A3] shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSidebar}
              className="sm:hidden mr-1 px-2 py-1 rounded-lg bg-white/80 border border-[#FFE6A3] text-xs text-gray-800"
            >
              ☰
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] flex items-center justify-center text-xs font-bold text-gray-900 shadow">
              ST
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                Student Area
              </p>
              <p className="text-sm font-semibold text-gray-900">
                NSO Student Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex px-3 py-1.5 rounded-full bg-white/80 border border-[#FFE6A3] text-gray-700 shadow-sm">
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 bg-white/80 border border-[#FFE6A3] rounded-full">
              <span className="w-6 h-6 rounded-full bg-[#FFCD2C] text-gray-900 flex items-center justify-center text-xs font-bold">
                S
              </span>
              <span className="hidden sm:block text-[11px] text-gray-800">
                Student
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
