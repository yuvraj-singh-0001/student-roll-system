import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { olympiadExamApi, examApi } from "../../api";

const EXAM_CACHE_KEY = "examListCacheV1";
const EXAM_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const readExamListCache = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(EXAM_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.data) || !parsed.ts) return null;
    if (Date.now() - parsed.ts > EXAM_CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeExamListCache = (list) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      EXAM_CACHE_KEY,
      JSON.stringify({ data: Array.isArray(list) ? list : [], ts: Date.now() })
    );
  } catch {
    // ignore cache write errors
  }
};
import { FaYoutube, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [recentResults, setRecentResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");
  const [examList, setExamList] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState("");

  const availableTests = examList;

  const upcomingOlympiads = [
    {
      id: 1,
      name: "International Math Olympiad",
      subject: "Mathematics",
      regClose: "10 Feb 2026",
      eventDate: "15 Feb 2026",
      daysRemaining: 15,
      status: "not_registered",
    },
    {
      id: 2,
      name: "National Science Olympiad",
      subject: "Physics & Chemistry",
      regClose: "20 Feb 2026",
      eventDate: "25 Feb 2026",
      daysRemaining: 25,
      status: "registered",
    },
    {
      id: 3,
      name: "English Language Olympiad",
      subject: "English",
      regClose: "05 Mar 2026",
      eventDate: "12 Mar 2026",
      daysRemaining: 40,
      status: "not_registered",
    },
    {
      id: 4,
      name: "Cyber Olympiad",
      subject: "Computer Science",
      regClose: "18 Mar 2026",
      eventDate: "25 Mar 2026",
      daysRemaining: 53,
      status: "not_registered",
    },
  ];

  // recent results will be loaded from backend

  useEffect(() => {
    let cancelled = false;
    let fetching = false;
    const cached = readExamListCache();
    const hasCache = Array.isArray(cached) && cached.length > 0;
    if (hasCache) setExamList(cached);
    setExamLoading(!hasCache);
    setExamError("");

    const fetchExams = async () => {
      if (fetching || cancelled) return;
      fetching = true;
      if (!hasCache) setExamLoading(true);
      try {
        const { data } = await examApi.list({
          retries: 2,
          retryDelayMs: 1500,
        });
        if (!cancelled) {
          if (data.success) {
            const list = data.data || [];
            setExamList(list);
            writeExamListCache(list);
          } else if (!hasCache) {
            setExamError(data.message || "Failed to load exams");
          }
        }
      } catch (e) {
        if (!cancelled && !hasCache) {
          setExamError(e.response?.data?.message || "Failed to load exams");
        }
      } finally {
        fetching = false;
        if (!cancelled) setExamLoading(false);
      }
    };

    if (!hasCache) {
      fetchExams();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const studentId = (
      localStorage.getItem("examStudentId") || localStorage.getItem("studentId") || ""
    ).trim();
    if (!studentId) return;

    let cancelled = false;
    setResultsLoading(true);
    setResultsError("");

    (async () => {
      try {
        const { data } = await olympiadExamApi.attempts({ studentId });
        if (!cancelled) {
          if (data.success) {
            setRecentResults(data.data || []);
          } else {
            setResultsError(data.message || "Failed to load results");
          }
        }
      } catch (e) {
        if (!cancelled) {
          setResultsError(e.response?.data?.message || "Failed to load results");
        }
      } finally {
        if (!cancelled) setResultsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] text-gray-900 overflow-hidden relative">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-24 w-80 h-80 bg-[#FFE6A3] rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 -left-24 w-80 h-80 bg-[#FFEBD0] rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-5rem] left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FFE0D9] rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        {/* MAIN */}
        <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Social Links */}
          <section className="rounded-2xl bg-white/90 border border-[#FFE6A3] backdrop-blur-xl p-4 shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Official Socials
                </h3>
                <p className="text-[11px] text-gray-600">
                  Follow The True Topper for updates and resources.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-500">
                @TheTrueTopper
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href="https://www.youtube.com/@TheTrueTopper"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2 text-xs font-medium text-red-600 hover:bg-[#FFF3C4] transition"
              >
                <FaYoutube className="text-sm" />
                YouTube
              </a>
              <a
                href="https://www.instagram.com/thetruetopperpvtltd/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2 text-xs font-medium text-pink-600 hover:bg-[#FFF3C4] transition"
              >
                <FaInstagram className="text-sm" />
                Instagram
              </a>
              <a
                href="https://www.linkedin.com/company/thetruetopper/posts/?feedView=all"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2 text-xs font-medium text-sky-700 hover:bg-[#FFF3C4] transition"
              >
                <FaLinkedinIn className="text-sm" />
                LinkedIn
              </a>
              <a
                href="https://x.com/TheTrueTopper"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2 text-xs font-medium text-gray-800 hover:bg-[#FFF3C4] transition"
              >
                <FaTwitter className="text-sm" />
                X (Twitter)
              </a>
            </div>
          </section>

          {/* SECOND ROW: Available Tests + Upcoming Olympiads */}
          <section className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2.5fr)] gap-4">
            {/* Available Tests */}
            <div className="rounded-2xl bg-white/90 border border-[#FFE6A3] backdrop-blur-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Available Tests
                  </h3>
                  <p className="text-[11px] text-gray-600">
                    Start your exam directly from here.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/student/exam")}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-[#FFD765] text-amber-800 bg-[#FFF9E6] hover:bg-[#FFEBB5] transition"
                >
                  View All
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {examLoading ? (
                  <div className="py-6 text-center text-xs text-gray-500 sm:col-span-2">
                    Loading exams...
                  </div>
                ) : examError ? (
                  <div className="py-6 text-center text-xs text-red-600 sm:col-span-2">
                    {examError}
                  </div>
                ) : availableTests.length > 0 ? (
                  availableTests.map((exam) => (
                    <div
                      key={exam.examCode}
                      className="group relative overflow-hidden rounded-2xl border border-[#FFE1B5] bg-white/95 shadow-sm hover:shadow-md transition"
                    >
                      <div className="absolute inset-0 pointer-events-none opacity-40 bg-gradient-to-br from-[#FFF3C4]/60 via-transparent to-[#FFE0D9]/70" />
                      <div className="relative p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-amber-700/80">
                              Exam Paper
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {exam.title || exam.examCode}
                            </p>
                            <p className="text-[11px] text-gray-600">
                              Exam Code: {exam.examCode} | Time:{" "}
                              {exam.totalTimeMinutes || 60} min
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] flex items-center justify-center text-[10px] font-bold text-gray-900 shadow">
                            TTT
                          </div>
                        </div>

                        <div className="text-[11px] text-gray-600">
                          Total Questions:{" "}
                          <span className="font-medium text-gray-900">
                            {exam.totalQuestions || 0}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            localStorage.setItem("examCode", exam.examCode);
                            navigate("/student/exam");
                          }}
                          className="mt-1 text-[11px] px-3 py-2 rounded-full bg-[#FFCD2C] text-gray-900 font-semibold hover:bg-[#FFC107] transition"
                        >
                          Start Exam
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-gray-500 sm:col-span-2">
                    No exams available yet.
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Olympiads */}
            <div className="rounded-2xl bg-white/90 border border-[#FFE6A3] backdrop-blur-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Upcoming Olympiads
                  </h3>
                  <p className="text-[11px] text-gray-600">
                    Register for upcoming exams here.
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {upcomingOlympiads.map((olymp) => (
                  <div
                    key={olymp.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-3"
                  >
                    <div className="text-xs text-gray-800">
                      <p className="font-medium">{olymp.name}</p>
                      <p className="text-[11px] text-gray-600">
                        Subject: {olymp.subject}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Reg closes: {olymp.regClose} | Event: {olymp.eventDate}
                      </p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        {olymp.daysRemaining} days remaining
                      </p>
                    </div>
                    <div>
                      {olymp.status === "registered" ? (
                        <button className="text-[11px] px-3 py-1.5 rounded-full bg-emerald-500 text-white font-medium">
                          Registered
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate("/student/register")}
                          className="text-[11px] px-3 py-1.5 rounded-full bg-[#FFCD2C] text-gray-900 font-medium hover:bg-[#FFC107] transition"
                        >
                          Register Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* THIRD ROW: Recent Results + Quick Actions */}
          <section className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
            {/* Recent Test Results */}
            <div className="rounded-2xl bg-white/90 border border-[#FFE6A3] backdrop-blur-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Recent Test Results
                  </h3>
                  <p className="text-[11px] text-gray-600">
                    Your latest exam attempts.
                  </p>
                </div>
                <button
                  onClick={() =>
                    recentResults.length > 0
                      ? navigate(`/student/result/${recentResults[0].attemptId}`)
                      : navigate("/student/result")
                  }
                  className="text-[11px] px-3 py-1.5 rounded-full border border-[#FFE6A3] text-gray-800 bg-[#FFF9E6] hover:bg-[#FFEBB5] transition"
                >
                  Full History
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-[11px]">
                  <thead className="text-gray-600">
                    <tr className="border-b border-[#FFE6A3]">
                      <th className="py-2 pr-3 text-left font-medium">
                        Exam Code
                      </th>
                      <th className="py-2 px-3 text-left font-medium">
                        Date
                      </th>
                      <th className="py-2 px-3 text-left font-medium">
                        Score
                      </th>
                      <th className="py-2 px-3 text-left font-medium">
                        Attempted / Skipped
                      </th>
                      <th className="py-2 px-3 text-left font-medium">
                        Correct / Wrong
                      </th>
                      <th className="py-2 pl-3 text-left font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsLoading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-6 text-center text-gray-500"
                        >
                          Loading results...
                        </td>
                      </tr>
                    ) : resultsError ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-6 text-center text-red-600"
                        >
                          {resultsError}
                        </td>
                      </tr>
                    ) : recentResults.length > 0 ? (
                      recentResults.map((res) => (
                        <tr
                          key={res.attemptId}
                          className="border-b border-[#FFF1CC] hover:bg-[#FFF9E6]"
                        >
                          <td className="py-2 pr-3 font-medium">
                            {res.examCode}
                          </td>
                          <td className="py-2 px-3">
                            {res.createdAt
                              ? new Date(res.createdAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="py-2 px-3">{res.totalMarks}</td>
                          <td className="py-2 px-3">
                            {res.attemptedCount} / {res.skippedCount}
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-emerald-700 font-medium">
                              {res.correctCount} correct
                            </span>
                            <span className="text-gray-400"> | </span>
                            <span className="text-red-700 font-medium">
                              {res.wrongCount} wrong
                            </span>
                          </td>
                          <td className="py-2 pl-3">
                            <button
                              onClick={() =>
                                navigate(`/student/result/${res.attemptId}`)
                              }
                              className="text-[11px] text-amber-700 hover:text-amber-900"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-6 text-center text-gray-500"
                        >
                          No attempts yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white/90 border border-[#FFE6A3] backdrop-blur-xl p-4 shadow-md">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">
                Quick Actions
              </h3>

              <div className="space-y-2 text-xs">
                <button
                  onClick={() =>
                    recentResults.length > 0
                      ? navigate(`/student/result/${recentResults[0].attemptId}`)
                      : navigate("/student/result")
                  }
                  className="w-full flex items-center justify-between gap-3 rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2 hover:bg-[#FFF3C4] transition"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-sky-400 flex items-center justify-center text-[10px] font-bold text-white">
                      H
                    </span>
                    <span className="text-gray-800">
                      Test History
                      <p className="text-[10px] text-gray-600">
                        View past test attempts.
                      </p>
                    </span>
                  </span>
                  <span className="text-gray-400">{">"}</span>
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-[#FFE6A3] bg-white/80 backdrop-blur-xl py-4 text-center text-[11px] text-gray-600">
          Student Portal (c) {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}








