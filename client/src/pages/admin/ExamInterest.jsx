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
        setTotals(
          res?.data?.totals || { exams: 0, totalInterests: 0, uniqueStudents: 0 }
        );
        setSelectedExamCode((prev) => {
          if (prev && examList.some((exam) => exam.examCode === prev)) return prev;
          return examList[0]?.examCode || "";
        });
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load exam interests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests(scope);
  }, [scope]);

  const selectedExam = useMemo(
    () => exams.find((exam) => exam.examCode === selectedExamCode) || null,
    [exams, selectedExamCode]
  );

  const filteredStudents = useMemo(() => {
    if (!selectedExam) return [];
    const q = String(search || "").trim().toLowerCase();
    if (!q) return selectedExam.students || [];
    return (selectedExam.students || []).filter((student) => {
      return [student.name, student.rollNumber, student.email, student.mobile, student.username]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [selectedExam, search]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-[#E0AC00] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Loading exam interests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exam Interest Tracker</h2>
          <p className="text-sm text-gray-600 mt-1">
            Upcoming olympiad exams me kitne students interested hain, aur kaun-kaun interested hai.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#FFE1B5] bg-white/90 px-2 py-2">
          <button
            onClick={() => setScope("upcoming")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              scope === "upcoming"
                ? "bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900"
                : "text-gray-600 hover:bg-[#FFF3C4]"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setScope("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              scope === "all"
                ? "bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900"
                : "text-gray-600 hover:bg-[#FFF3C4]"
            }`}
          >
            All Exams
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white/95 border border-[#FFE6A3] p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Exams</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totals.exams || 0}</p>
        </div>
        <div className="rounded-2xl bg-white/95 border border-[#FFE6A3] p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Interests</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totals.totalInterests || 0}</p>
        </div>
        <div className="rounded-2xl bg-white/95 border border-[#FFE6A3] p-4 shadow-sm">
          <p className="text-xs text-gray-500">Unique Interested Students</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totals.uniqueStudents || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-2 rounded-2xl bg-white/95 border border-[#FFE6A3] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#FFE6A3] bg-[#FFF9E6]/80">
            <p className="text-sm font-semibold text-gray-900">Exam-wise Interest</p>
          </div>

          {exams.length === 0 ? (
            <div className="px-4 py-8 text-sm text-gray-500">No exam interest data available.</div>
          ) : (
            <div className="max-h-[62vh] overflow-y-auto">
              {exams.map((exam) => {
                const active = exam.examCode === selectedExamCode;
                return (
                  <button
                    key={exam.examCode}
                    onClick={() => setSelectedExamCode(exam.examCode)}
                    className={`w-full text-left px-4 py-3 border-b border-[#FFF2CC] transition ${
                      active ? "bg-[#FFF3C4]" : "hover:bg-[#FFF9E6]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{exam.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{exam.examCode}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#FFEBB5] text-gray-900">
                        {Number(exam.interestedCount) || 0}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2">
                      Start: {formatDateTime(exam.examStartAt)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="xl:col-span-3 rounded-2xl bg-white/95 border border-[#FFE6A3] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#FFE6A3] bg-[#FFF9E6]/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {selectedExam ? selectedExam.title : "Interested Students"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedExam ? `${selectedExam.examCode} • ${selectedExam.interestedCount || 0} students` : "Select an exam"}
              </p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, roll no, email"
              className="w-full md:w-72 px-3 py-2 text-sm border border-[#FFE1B5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCD2C] bg-white"
            />
          </div>

          {!selectedExam ? (
            <div className="px-4 py-8 text-sm text-gray-500">Select an exam to view students.</div>
          ) : filteredStudents.length === 0 ? (
            <div className="px-4 py-8 text-sm text-gray-500">No students match this search.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#FFF9E6] text-gray-700">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold">Student</th>
                    <th className="text-left px-4 py-2 font-semibold">Roll Number</th>
                    <th className="text-left px-4 py-2 font-semibold">Email</th>
                    <th className="text-left px-4 py-2 font-semibold">Mobile</th>
                    <th className="text-left px-4 py-2 font-semibold">Interested At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.interestId} className="border-t border-[#FFF2CC] hover:bg-[#FFFDF3]">
                      <td className="px-4 py-2">
                        <p className="font-medium text-gray-900">{student.name || "-"}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{student.username || "-"}</p>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{student.rollNumber || "-"}</td>
                      <td className="px-4 py-2 text-gray-700">{student.email || "-"}</td>
                      <td className="px-4 py-2 text-gray-700">{student.mobile || "-"}</td>
                      <td className="px-4 py-2 text-gray-700">{formatDateTime(student.interestedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}