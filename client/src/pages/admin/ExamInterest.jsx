import { useEffect, useMemo, useState } from "react";
import { analysisApi } from "../../api";

function formatDateTime(value) {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(value) {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString([], { day: "2-digit", month: "short", year: "numeric" });
}

function formatTimeShort(value) {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleString([], { hour: "2-digit", minute: "2-digit" });
}

function daysUntil(value) {
  if (!value) return null;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return Math.ceil((dt - Date.now()) / (1000 * 60 * 60 * 24));
}

const CARD_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-600", text: "text-blue-700", soft: "text-blue-500", count: "bg-blue-100 text-blue-800", ring: "ring-blue-400" },
  { bg: "bg-indigo-50", border: "border-indigo-200", badge: "bg-indigo-600", text: "text-indigo-700", soft: "text-indigo-500", count: "bg-indigo-100 text-indigo-800", ring: "ring-indigo-400" },
  { bg: "bg-sky-50", border: "border-sky-200", badge: "bg-sky-600", text: "text-sky-700", soft: "text-sky-500", count: "bg-sky-100 text-sky-800", ring: "ring-sky-400" },
  { bg: "bg-cyan-50", border: "border-cyan-200", badge: "bg-cyan-600", text: "text-cyan-700", soft: "text-cyan-500", count: "bg-cyan-100 text-cyan-800", ring: "ring-cyan-400" },
  { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-600", text: "text-violet-700", soft: "text-violet-500", count: "bg-violet-100 text-violet-800", ring: "ring-violet-400" },
];
const getColor = (idx) => CARD_COLORS[idx % CARD_COLORS.length];

export default function ExamInterest() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scope, setScope] = useState("upcoming");
  const [exams, setExams] = useState([]);
  const [totals, setTotals] = useState({ exams: 0, totalInterests: 0, uniqueStudents: 0 });
  const [selectedExamCode, setSelectedExamCode] = useState("");
  const [search, setSearch] = useState("");

  const fetchInterests = async (requestedScope = scope) => {
    try {
      setLoading(true);
      setError("");
      const { data: res } = await analysisApi.examInterests({ scope: requestedScope });
      if (res?.success) {
        const examList = res?.data?.exams || [];
        setExams(examList);
        setTotals(res?.data?.totals || { exams: 0, totalInterests: 0, uniqueStudents: 0 });
        setSelectedExamCode((prev) => {
          if (prev && examList.some((e) => e.examCode === prev)) return prev;
          return examList[0]?.examCode || "";
        });
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load exam interests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInterests(scope); }, [scope]);

  const selectedIdx = useMemo(
    () => exams.findIndex((e) => e.examCode === selectedExamCode),
    [exams, selectedExamCode]
  );
  const selectedExam = useMemo(
    () => (selectedIdx >= 0 ? exams[selectedIdx] : null),
    [exams, selectedIdx]
  );

  const filteredStudents = useMemo(() => {
    if (!selectedExam) return [];
    const q = String(search || "").trim().toLowerCase();
    if (!q) return selectedExam.students || [];
    return (selectedExam.students || []).filter((s) =>
      [s.name, s.rollNumber, s.email, s.mobile, s.username]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [selectedExam, search]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 mx-auto border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400 tracking-widest uppercase">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm">
        {error}
      </div>
    );
  }

  const ac = getColor(selectedIdx >= 0 ? selectedIdx : 0);

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Exam Interest Tracker</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Get an instant overview of student interest across exams.
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 border border-gray-200 shrink-0">
          {[["upcoming", "Upcoming"], ["all", "All Exams"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setScope(val)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                scope === val ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-blue-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Global Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Exams", value: totals.exams || 0, icon: "📋", sub: "in this scope" },
          { label: "Total Interests", value: totals.totalInterests || 0, icon: "⭐", sub: "across all exams" },
          { label: "Unique Students", value: totals.uniqueStudents || 0, icon: "👥", sub: "interested overall" },
        ].map(({ label, value, icon, sub }) => (
          <div key={label} className="rounded-xl border border-blue-100 bg-white px-4 py-3 shadow-sm flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums leading-tight">{value}</p>
              <p className="text-[10px] text-gray-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Exam Cards — at-a-glance ── */}
      {exams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center text-sm text-gray-400">
          No exam data found.
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2 px-0.5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              {exams.length} Exam{exams.length !== 1 ? "s" : ""} — Click a card to view detailed student interest
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {exams.map((exam, idx) => {
              const c = getColor(idx);
              const active = exam.examCode === selectedExamCode;
              const days = daysUntil(exam.examStartAt);
              const pct = totals.totalInterests > 0
                ? Math.round(((exam.interestedCount || 0) / totals.totalInterests) * 100)
                : 0;

              return (
                <button
                  key={exam.examCode}
                  onClick={() => { setSelectedExamCode(exam.examCode); setSearch(""); }}
                  className={`text-left rounded-xl border-2 p-3.5 transition-all duration-150 shadow-sm ${
                    active
                      ? `${c.border} ${c.bg} ring-2 ring-offset-1 ${c.ring} shadow-md`
                      : "border-gray-100 bg-white hover:shadow-md hover:border-gray-200"
                  }`}
                >
                  {/* Code + Count */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md ${c.count}`}>
                      {exam.examCode}
                    </span>
                    <div className="text-right">
                      <p className={`text-xl font-extrabold tabular-nums leading-none ${c.text}`}>
                        {exam.interestedCount || 0}
                      </p>
                      <p className="text-[9px] text-gray-400 mt-0.5">students</p>
                    </div>
                  </div>

                  {/* Title */}
                  <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 mb-2">
                    {exam.title}
                  </p>

                  {/* Date & Countdown */}
                  <div className="space-y-0.5 mb-2.5">
                    <p className={`text-[11px] font-medium ${c.soft}`}>
                      📅 {formatDateShort(exam.examStartAt)}
                      {formatTimeShort(exam.examStartAt) && (
                        <span className="text-gray-400 ml-1">· {formatTimeShort(exam.examStartAt)}</span>
                      )}
                    </p>
                    {days !== null && (
                      <p className="text-[10px] text-gray-400">
                        {days > 0 ? `⏳ ${days} days remaining` : days === 0 ? "🔴 Starts today" : "✅ Completed"}
                      </p>
                    )}
                  </div>

                  {/* Interest share bar */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[9px] text-gray-400 uppercase tracking-wide">Total interest share</span>
                      <span className={`text-[10px] font-bold ${c.text}`}>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${c.badge} transition-all duration-500`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Student Detail Table ── */}
      {selectedExam && (
        <div className={`rounded-xl border-2 ${ac.border} bg-white shadow-sm overflow-hidden`}>

          {/* Table Header */}
          <div className={`px-4 py-3 ${ac.bg} border-b ${ac.border} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5`}>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">{selectedExam.title}</p>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1">
                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${ac.count}`}>
                  {selectedExam.examCode}
                </span>
                <span className="text-[11px] text-gray-500">
                  📅 {formatDateTime(selectedExam.examStartAt)}
                </span>
                <span className={`text-[11px] font-bold ${ac.text}`}>
                  ⭐ {selectedExam.interestedCount || 0} interested students
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="relative shrink-0">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, roll number, email, or mobile"
                className="pl-8 pr-7 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white w-56 placeholder:text-gray-400"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold">
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {filteredStudents.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-gray-400">
              {search ? `No student found for "${search}".` : "No student has marked interest for this exam yet."}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                      <th className="px-3 py-2.5 text-left font-semibold w-8">#</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Student Name</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Username</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Roll Number</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Email</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Mobile</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Interested At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStudents.map((student, idx) => (
                      <tr key={student.interestId} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-3 py-2 text-gray-300 tabular-nums">{idx + 1}</td>
                        <td className="px-3 py-2 font-semibold text-gray-900 whitespace-nowrap">{student.name || "-"}</td>
                        <td className="px-3 py-2 font-mono text-[11px] text-gray-400">{student.username || "-"}</td>
                        <td className="px-3 py-2 font-mono text-gray-700">{student.rollNumber || "-"}</td>
                        <td className="px-3 py-2 text-gray-600">{student.email || "-"}</td>
                        <td className="px-3 py-2 text-gray-600">{student.mobile || "-"}</td>
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{formatDateTime(student.interestedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <p className="text-[11px] text-gray-400">
                  {search
                    ? <><span className="font-semibold text-gray-700">{filteredStudents.length}</span> results for "<span className="font-semibold text-gray-700">{search}</span>"</>
                    : <><span className="font-semibold text-gray-700">{filteredStudents.length}</span> students interested in this exam</>
                  }
                </p>
                {search && (
                  <button onClick={() => setSearch("")} className="text-[11px] text-blue-500 hover:text-blue-700 font-semibold">
                    Clear search
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}