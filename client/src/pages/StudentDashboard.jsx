import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen student-bg">
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Back to Home"
            >
              ← Home
            </button>
            <span className="text-slate-400">|</span>
            <h1 className="text-lg font-bold text-slate-800">Student Portal</h1>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-800">What would you like to do?</h2>
          <p className="text-slate-500 mt-1 text-sm">Register first, then take the exam.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/student/register")}
            className="w-full flex items-center gap-4 p-5 bg-white rounded-xl shadow-lg border border-indigo-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 text-left group animate-fade-in-up"
          >
            <div className="w-12 h-12 rounded-xl student-accent flex items-center justify-center text-xl text-white shadow-md group-hover:scale-105 transition-transform">
              📝
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">Exam Registration</h3>
              <p className="text-sm text-slate-500">Register with name & email, get your Student ID.</p>
            </div>
            <span className="text-indigo-500 font-medium">→</span>
          </button>

          <button
            onClick={() => navigate("/student/exam")}
            className="w-full flex items-center gap-4 p-5 bg-white rounded-xl shadow-lg border border-indigo-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 text-left group animate-fade-in-up delay-1"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-xl text-white shadow-md group-hover:scale-105 transition-transform">
              ✏️
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">Give Exam</h3>
              <p className="text-sm text-slate-500">Take the online test with confidence levels.</p>
            </div>
            <span className="text-indigo-500 font-medium">→</span>
          </button>
        </div>
      </main>
    </div>
  );
}
