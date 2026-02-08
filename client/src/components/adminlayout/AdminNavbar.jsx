import { useEffect, useState } from "react";

export default function AdminNavbar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#FEECD5]/90 backdrop-blur-xl border-b border-[#FFE6A3] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] flex items-center justify-center shadow-lg">
              <span className="text-gray-900 font-bold text-sm">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Admin Area
              </h1>
              <p className="text-xs text-gray-600">
                Manage exams, students & system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/90 border border-[#FFE6A3] rounded-xl shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                System Online
              </span>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 rounded-xl shadow-lg">
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
  );
}
