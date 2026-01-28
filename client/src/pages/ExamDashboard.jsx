import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { analysisApi } from "../api";

export default function ExamDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data: res } = await analysisApi.dashboard();
      if (res.success) setData(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen admin-bg flex flex-col items-center justify-center">
        <header className="absolute top-0 left-0 right-0 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => navigate("/admin")} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">← Admin</button>
            <span className="text-slate-300">|</span>
            <h1 className="text-lg font-bold text-slate-800">Exam Dashboard</h1>
          </div>
        </header>
        <p className="text-slate-500 animate-pulse-soft">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen admin-bg flex flex-col items-center justify-center p-4">
        <header className="absolute top-0 left-0 right-0 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => navigate("/admin")} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">← Admin</button>
            <span className="text-slate-300">|</span>
            <h1 className="text-lg font-bold text-slate-800">Exam Dashboard</h1>
          </div>
        </header>
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md animate-scale-in border border-slate-200">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate("/admin")} className="py-2.5 px-5 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-800">
            ← Admin Panel
          </button>
        </div>
      </div>
    );
  }

  const { studentWise: st, questionWise: qw, confidenceWise: cw, totals, totalStudents, totalQuestions } = data || {};

  return (
    <div className="min-h-screen admin-bg">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              ← Admin
            </button>
            <span className="text-slate-300">|</span>
            <h1 className="text-lg font-bold text-slate-800">Exam Dashboard</h1>
          </div>
          <button
            onClick={fetchDashboard}
            className="py-2 px-4 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-800 transition text-sm"
          >
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total students (attempted)", value: totalStudents ?? 0, hex: "#475569" },
            { label: "Total questions", value: totalQuestions ?? 0, hex: "#2563eb" },
            { label: "Attempted", value: totals?.attempted ?? 0, hex: "#16a34a" },
            { label: "Skipped", value: totals?.skipped ?? 0, hex: "#d97706" },
          ].map(({ label, value, hex }) => (
            <div
              key={label}
              className="bg-white rounded-xl shadow border border-slate-200 p-4 animate-fade-in-up"
            >
              <p className="text-sm text-slate-500 mb-1">{label}</p>
              <p className="text-2xl font-bold" style={{ color: hex }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in-up delay-1">
            <div className="h-1 bg-slate-600" />
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Correct vs wrong</h2>
              <div className="flex gap-4">
                <div className="flex-1 p-4 bg-green-50 rounded-xl text-center border border-green-100">
                  <p className="text-2xl font-bold text-green-700">{totals?.correct ?? 0}</p>
                  <p className="text-sm text-green-600">Correct</p>
                </div>
                <div className="flex-1 p-4 bg-red-50 rounded-xl text-center border border-red-100">
                  <p className="text-2xl font-bold text-red-700">{totals?.wrong ?? 0}</p>
                  <p className="text-sm text-red-600">Wrong</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in-up delay-2">
            <div className="h-1 bg-slate-500" />
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Confidence impact</h2>
              <div className="space-y-2 text-sm">
                {["full", "middle", "low"].map((l) => (
                  <div key={l} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="capitalize font-medium text-slate-700">{l}</span>
                    <span className="text-slate-600">
                      ✓ {cw?.[l]?.correct ?? 0} &nbsp; ✗ {cw?.[l]?.wrong ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {qw?.mostAttempted != null && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8 animate-fade-in-up delay-3">
            <div className="h-1 bg-blue-500" />
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Question-wise</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-slate-500 mb-1">Most attempted</p>
                  <p className="font-bold text-slate-800">Q{qw.mostAttempted?.questionNumber} ({qw.mostAttempted?.attemptCount})</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-slate-500 mb-1">Least attempted</p>
                  <p className="font-bold text-slate-800">Q{qw.leastAttempted?.questionNumber} ({qw.leastAttempted?.attemptCount})</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-slate-500 mb-1">Most wrong</p>
                  <p className="font-bold text-slate-800">Q{qw.mostWrong?.questionNumber} ({qw.mostWrong?.wrongCount})</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-slate-500 mb-1">Most confusing (top)</p>
                  <p className="font-bold text-slate-800">
                    {qw.mostConfusing?.length
                      ? `Q${qw.mostConfusing[0]?.questionNumber} (wrong: ${qw.mostConfusing[0]?.wrongCount})`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in-up delay-4">
          <div className="h-1 bg-slate-600" />
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Student-wise results</h2>
            {Array.isArray(st) && st.length > 0 ? (
              <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Student ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Attempted</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Skipped</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Score</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Correct / Wrong</th>
                    </tr>
                  </thead>
                  <tbody>
                    {st.map((s) => (
                      <tr key={s.studentId} className="border-t border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-mono font-medium text-slate-800">{s.studentId}</td>
                        <td className="px-4 py-3 text-slate-600">{s.name}</td>
                        <td className="px-4 py-3 text-slate-600">{s.attempted}</td>
                        <td className="px-4 py-3 text-slate-600">{s.skipped}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{s.totalScore}</td>
                        <td className="px-4 py-3 text-slate-600">{s.correct} / {s.wrong}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">No exam attempts yet.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
