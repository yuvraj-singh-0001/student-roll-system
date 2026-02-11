import { useLocation, useNavigate } from "react-router-dom";

export default function ExamResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state || {};
  const total = data.totalMarks ?? 0;
  const attempted = data.attempted ?? 0;
  const skipped = data.skipped ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] overflow-hidden relative">
      {/* background blobs (same family) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-24 w-72 h-72 bg-[#FFE6A3] rounded-full blur-3xl animate-blob" />
        <div className="absolute top-32 -left-24 w-72 h-72 bg-[#FFEBD0] rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* header */}
      <header className="relative z-10 border-b border-[#FFE6A3] bg-[#FEECD5]/90 backdrop-blur-sm sticky top-0">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/student")}
            className="px-3 py-1.5 rounded-full bg-white/90 border border-[#FFE6A3] text-xs text-gray-700 hover:bg-[#FFF3C4] transition"
          >
            ← Student Portal
          </button>
          <span className="text-gray-400 text-sm">|</span>
          <h1 className="text-lg font-bold text-gray-900">Exam Result</h1>
        </div>
      </header>

      {/* main card */}
      <main className="relative z-10 max-w-xl mx-auto px-4 py-10">
        <div className="bg-white/95 rounded-2xl shadow-xl border border-[#FFE6A3] overflow-hidden animate-scale-in backdrop-blur">
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-[#FFCD2C] to-emerald-400" />
          <div className="p-6 sm:p-10">
            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-4xl text-emerald-500 animate-fade-in shadow-md">
                ✓
              </div>
            </div>

            {/* message */}
            <div className="text-center space-y-4 animate-fade-in-up delay-1">
              <h2 className="text-2xl font-bold text-gray-900">
                Exam submitted successfully
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Your answers have been recorded and evaluated. Thank you for
                completing the exam.
              </p>
            </div>

            {/* score card */}
            <div className="mt-8 p-6 bg-[#FFF9E6] rounded-xl border border-[#FFE6A3] animate-fade-in-up delay-2">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total score
              </p>
              <p className="text-4xl font-bold text-emerald-600">{total}</p>
              <div className="mt-4 flex gap-6 text-sm text-gray-700">
                <span>
                  Attempted:{" "}
                  <span className="font-semibold text-gray-900">
                    {attempted}
                  </span>
                </span>
                <span>
                  Skipped:{" "}
                  <span className="font-semibold text-gray-900">
                    {skipped}
                  </span>
                </span>
              </div>
            </div>

            {/* actions */}
            <div className="mt-8 flex flex-col gap-3 animate-fade-in-up delay-3">
              <button
                onClick={() => navigate("/student/exam")}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 font-semibold shadow-lg hover:shadow-amber-300/80 hover:-translate-y-[1px] transition"
              >
                Give exam again
              </button>
              <button
                onClick={() => navigate("/student")}
                className="w-full py-3 px-4 bg-white/90 text-gray-800 font-semibold rounded-xl border border-[#FFE6A3] hover:bg-[#FFF3C4] transition"
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
