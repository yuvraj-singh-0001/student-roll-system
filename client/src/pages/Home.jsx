import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen student-bg flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
          Online Exam System
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Choose your portal — Student or Admin
        </p>
      </div>

      <div className="w-full max-w-2xl grid sm:grid-cols-2 gap-6 sm:gap-8">
        {/* Student Panel */}
        <button
          onClick={() => navigate("/student")}
          className="group relative overflow-hidden bg-white rounded-2xl shadow-xl border-2 border-indigo-200 hover:border-indigo-400 p-8 sm:p-10 text-left transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.99] animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-bl-[3rem] opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-14 h-14 rounded-xl student-accent flex items-center justify-center text-2xl text-white mb-4 shadow-lg">
              🎓
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Student Portal</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Register, give exam, and view your results.
            </p>
            <span className="inline-flex items-center gap-2 mt-4 text-indigo-600 font-semibold text-sm">
              Enter as Student →
            </span>
          </div>
        </button>

        {/* Admin Panel */}
        <button
          onClick={() => navigate("/admin")}
          className="group relative overflow-hidden bg-white rounded-2xl shadow-xl border-2 border-slate-200 hover:border-slate-400 p-8 sm:p-10 text-left transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.99] animate-fade-in-up delay-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 rounded-bl-[3rem] opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-14 h-14 rounded-xl admin-accent flex items-center justify-center text-2xl text-white mb-4 shadow-lg">
              ⚙️
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Admin Panel</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Add questions, view analytics, manage students.
            </p>
            <span className="inline-flex items-center gap-2 mt-4 text-slate-600 font-semibold text-sm">
              Enter as Admin →
            </span>
          </div>
        </button>
      </div>

      <p className="mt-10 text-slate-400 text-xs">
        The True Topper © 2026 · Exam System v1.0
      </p>
    </div>
  );
}
