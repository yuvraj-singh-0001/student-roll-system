import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { olympiadExamApi, examApi } from "../../api";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [recentResults, setRecentResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");
  const [examList, setExamList] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState("");

  const student = {
    name: "Rahul Sharma",
    rollNo: "STU-1023",
    class: "Class 8",
    school: "ABC Public School",
    testsCompleted: 12,
    averageScore: 87,
    overallRank: 15,
  };

  const youtubeStatus = {
    isSubscribed: true,
    channelName: "StudentOlympiad Official",
  };

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
    setExamLoading(true);
    setExamError("");

    (async () => {
      try {
        const { data } = await examApi.list();
        if (!cancelled) {
          if (data.success) {
            setExamList(data.data || []);
          } else {
            setExamError(data.message || "Failed to load exams");
          }
        }
      } catch (e) {
        if (!cancelled) {
          setExamError(e.response?.data?.message || "Failed to load exams");
        }
      } finally {
        if (!cancelled) setExamLoading(false);
      }
    })();

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
          {/* WELCOME + SUMMARY */}
          <section className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex-1 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                Dashboard | Home View
              </p>
              <h1 className="text-xl font-semibold text-gray-900">
                Welcome back, {student.name.split(" ")[0]}
              </h1>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="rounded-2xl bg-white/80 border border-[#FFE6A3] px-4 py-2 shadow-sm">
                <p className="text-[11px] text-gray-600">
                  Overall Progress
                </p>
                <p className="mt-1 font-semibold text-emerald-600">
                  {student.averageScore}% avg | {student.testsCompleted} tests
                </p>
              </div>
            </div>
          </section>

          {/* FIRST ROW: Profile + YT Subscription */}
          <section className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] gap-4">
            {/* Student Profile Card */}
            <div className="relative overflow-hidden rounded-2xl border border-[#FFE6A3] bg-white/90 backdrop-blur-xl shadow-lg">
              <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-[#FFEBB5]/60 via-transparent to-[#FFE0D9]/80" />
              <div className="relative p-5 flex gap-4 items-start">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] flex items-center justify-center text-sm font-bold text-gray-900 shadow-md">
                  ST
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-amber-700/80">
                        Student Profile
                      </p>
                      <h2 className="text-lg font-semibold mt-0.5 text-gray-900">
                        {student.name}
                      </h2>
                    </div>
                    <button
                      onClick={() => navigate("/student/profile")}
                      className="text-[11px] px-3 py-1 rounded-full border border-[#FFE6A3] bg-white/80 hover:bg-[#FFF3C4] transition"
                    >
                      Edit Profile
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-700 mt-2">
                    <span>
                      Roll No:{" "}
                      <span className="font-medium text-gray-900">
                        {student.rollNo}
                      </span>
                    </span>
                    <span>
                      Class:{" "}
                      <span className="font-medium text-gray-900">
                        {student.class}
                      </span>
                    </span>
                    <span className="col-span-2 truncate">
                      School:{" "}
                      <span className="font-medium text-gray-900">
                        {student.school}
                      </span>
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                    <div className="rounded-xl bg-[#FFF9E6] border border-[#FFE6A3] p-2">
                      <p className="text-gray-600">Tests Completed</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-600">
                        {student.testsCompleted}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#FFF9E6] border border-[#FFE6A3] p-2">
                      <p className="text-gray-600">Average Score</p>
                      <p className="mt-1 text-sm font-semibold text-amber-700">
                        {student.averageScore}%
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#FFF9E6] border border-[#FFE6A3] p-2">
                      <p className="text-gray-600">Overall Rank</p>
                      <p className="mt-1 text-sm font-semibold text-indigo-700">
                        #{student.overallRank}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* YouTube Subscription Status */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-300/70 bg-emerald-50/90 backdrop-blur-xl shadow-lg">
              <div className="absolute right-[-40px] top-[-40px] w-40 h-40 bg-emerald-300/40 rounded-full blur-3xl" />
              <div className="relative p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wide text-emerald-800/80">
                    YouTube Subscription
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800">
                    {youtubeStatus.isSubscribed ? "Verified" : "Not Verified"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                    YT
                  </div>
                  <div className="text-xs text-gray-800">
                    <p className="font-medium">{youtubeStatus.channelName}</p>
                    <p className="text-gray-700 mt-1">
                      Subscription is verified, so exam access is enabled.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    window.open("https://youtube.com", "_blank")
                  }
                  className="w-full mt-2 text-[11px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white py-2 font-medium shadow-lg shadow-emerald-300/60 hover:shadow-emerald-400/80 hover:-translate-y-[1px] transition-all"
                >
                  Open YouTube Channel
                </button>
              </div>
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
                  <span className="text-gray-400">></span>
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








