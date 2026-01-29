import { useLocation, useNavigate } from "react-router-dom";

export default function ExamResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state || {};
  const total = (data.totalMarks ?? 0);
  const attempted = data.attempted ?? 0;
  const skipped = data.skipped ?? 0;

  return (
    <div className="min-h-screen student-bg">
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/student")}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            ← Student Portal
          </button>
          <span className="text-slate-400">|</span>
          <h1 className="text-lg font-bold text-slate-800">Exam Result</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden animate-scale-in">
          <div className="h-1 bg-green-500" />
          <div className="p-6 sm:p-10">
            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl text-green-600 animate-fade-in">
                ✓
              </div>
            </div>

            {/* Full message */}
            <div className="text-center space-y-4 animate-fade-in-up delay-1">
              <h2 className="text-2xl font-bold text-slate-800">
                Exam submitted successfully
              </h2>
              <p className="text-slate-500 leading-relaxed">
                Your answers have been recorded and evaluated. Thank you for completing the exam.
              </p>
            </div>

            {/* Score card */}
            <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in-up delay-2">
              <p className="text-sm font-medium text-slate-500 mb-1">Total score</p>
              <p className="text-4xl font-bold text-indigo-600">{total}</p>
              <div className="mt-4 flex gap-6 text-sm">
                <span className="text-slate-600">
                  Attempted: <strong>{attempted}</strong>
                </span>
                <span className="text-slate-600">
                  Skipped: <strong>{skipped}</strong>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 animate-fade-in-up delay-3">
              <button
                onClick={() => navigate("/student/exam")}
                className="w-full py-3.5 px-4 student-accent text-white font-semibold rounded-xl hover:opacity-90 transition shadow-lg"
              >
                Give exam again
              </button>
              <button
                onClick={() => navigate("/student")}
                className="w-full py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
              >
                ← Back to Student Portal
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
