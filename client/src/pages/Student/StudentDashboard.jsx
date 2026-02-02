import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const fileInputRef = useRef(null);

  // Dummy data (baad me API / context se aayega)
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

  const availableTests = [
    {
      id: 1,
      name: "Maths Practice Test",
      subject: "Mathematics",
      time: "60 min",
      questions: 30,
      eligibleClasses: "6–8",
      examDate: "05 Feb 2026",
      isEligible: true,
    },
    {
      id: 2,
      name: "Physics Concept Test",
      subject: "Physics",
      time: "45 min",
      questions: 25,
      eligibleClasses: "8–10",
      examDate: "08 Feb 2026",
      isEligible: true,
    },
    {
      id: 3,
      name: "English Grammar Test",
      subject: "English",
      time: "40 min",
      questions: 40,
      eligibleClasses: "5–8",
      examDate: "03 Feb 2026",
      isEligible: false,
    },
  ];

  const upcomingOlympiads = [
    {
      id: 1,
      name: "International Math Olympiad",
      subject: "Mathematics",
      regClose: "10 Feb 2026",
      eventDate: "15 Feb 2026",
      daysRemaining: 15,
      status: "not_registered", // "registered"
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

  const recentResults = [
    {
      id: 1,
      name: "IMO Level 1",
      subject: "Mathematics",
      date: "10 Jan 2026",
      score: "92%",
      status: "Passed",
    },
    {
      id: 2,
      name: "NSO Mock Test",
      subject: "Science",
      date: "5 Jan 2026",
      score: "84%",
      status: "Passed",
    },
    {
      id: 3,
      name: "English Weekly Quiz",
      subject: "English",
      date: "28 Dec 2025",
      score: "78%",
      status: "Passed",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVideoUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log("Selected video file:", file);
    // Yahan se tum API pe upload / next page navigate kar sakte ho
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100 overflow-hidden relative">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-24 w-80 h-80 bg-cyan-500/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 -left-24 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-5rem] left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              {/* Left: Logo + Title */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-lg">
                  🎓
                </div>
                <span className="text-sm font-semibold">
                  Student Olympiad Portal
                </span>
              </div>

              {/* Center: Nav Links */}
              <nav className="hidden sm:flex items-center gap-4 text-xs font-medium">
                <button className="px-3 py-1.5 rounded-full bg-slate-800 text-cyan-300 border border-cyan-500/40">
                  🏠 Dashboard
                </button>
                <button
                  onClick={() => navigate("/student/exam")}
                  className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-200 transition"
                >
                  📝 My Tests
                </button>
                <button
                  onClick={() => navigate("/student/video-upload")}
                  className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-200 transition"
                >
                  🎥 Video Upload
                </button>
              </nav>

              {/* Right: Time + Logout */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-[11px]">
                  {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                <button
                  onClick={() => navigate("/logout")}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-red-500/60 text-red-300 hover:bg-red-500/10 transition"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* WELCOME + SUMMARY */}
          <section className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex-1 space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Dashboard • Home View
              </p>
              <h1 className="text-xl font-semibold">
                Welcome back, {student.name.split(" ")[0]} 👋
              </h1>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="rounded-2xl bg-slate-900/70 border border-white/10 px-4 py-2">
                <p className="text-[11px] text-slate-300/80">
                  Overall Progress
                </p>
                <p className="mt-1 font-semibold text-cyan-300">
                  {student.averageScore}% avg • {student.testsCompleted} tests
                </p>
              </div>
            </div>
          </section>

          {/* FIRST ROW: Profile + YT Subscription */}
          <section className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] gap-4">
            {/* Student Profile Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.7)]">
              <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20" />
              <div className="relative p-5 flex gap-4 items-start">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl">
                  👤
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-cyan-300/80">
                        Student Profile
                      </p>
                      <h2 className="text-lg font-semibold mt-0.5">
                        {student.name}
                      </h2>
                    </div>
                    <button
                      onClick={() => navigate("/student/profile")}
                      className="text-[11px] px-3 py-1 rounded-full border border-white/15 hover:bg-white/10 transition"
                    >
                      ✏️ Edit Profile
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-200/85 mt-2">
                    <span>Roll No: <span className="font-medium text-white">{student.rollNo}</span></span>
                    <span>Class: <span className="font-medium text-white">{student.class}</span></span>
                    <span className="col-span-2 truncate">
                      School: <span className="font-medium text-white">{student.school}</span>
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                    <div className="rounded-xl bg-slate-900/70 border border-white/10 p-2">
                      <p className="text-slate-300/75">Tests Completed</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-300">
                        {student.testsCompleted}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-900/70 border border-white/10 p-2">
                      <p className="text-slate-300/75">Average Score</p>
                      <p className="mt-1 text-sm font-semibold text-cyan-300">
                        {student.averageScore}%
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-900/70 border border-white/10 p-2">
                      <p className="text-slate-300/75">Overall Rank</p>
                      <p className="mt-1 text-sm font-semibold text-amber-300">
                        #{student.overallRank}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* YouTube Subscription Status */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-400/40 bg-emerald-500/10 backdrop-blur-xl shadow-[0_18px_45px_rgba(6,78,59,0.6)]">
              <div className="absolute right-[-40px] top-[-40px] w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl" />
              <div className="relative p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wide text-emerald-200/90">
                    YouTube Subscription
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-100">
                    {youtubeStatus.isSubscribed ? "✔️ Verified" : "🔴 Not Verified"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center text-xl">
                    ▶️
                  </div>
                  <div className="text-xs">
                    <p className="font-medium">{youtubeStatus.channelName}</p>
                    <p className="text-slate-100/80 mt-1">
                      Subscription verified hai, is wajah se test access enabled hai. Bina subscription exam start nahi hoga.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => window.open("https://youtube.com", "_blank")}
                  className="w-full mt-2 text-[11px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-slate-950 py-2 font-medium shadow-lg shadow-emerald-500/40 hover:shadow-emerald-400/60 hover:-translate-y-[1px] transition-all"
                >
                  🎬 Open YouTube Channel
                </button>
              </div>
            </div>
          </section>

          {/* SECOND ROW: Available Tests + Upcoming Olympiads */}
          <section className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2.5fr)] gap-4">
            {/* Available Tests */}
            <div className="rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">Available Tests</h3>
                  <p className="text-[11px] text-slate-300/80">
                    Yahan se directly exam start kar sakte hain
                  </p>
                </div>
                <button
                  onClick={() => navigate("/student/exam")}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-cyan-400/60 text-cyan-200 hover:bg-cyan-500/10 transition"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {availableTests.map((test) => (
                  <div
                    key={test.id}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3 hover:border-cyan-400/70 hover:bg-slate-900 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-sm">
                        📘
                      </div>
                      <div className="text-xs">
                        <p className="font-medium">{test.name}</p>
                        <p className="text-slate-300/80 text-[11px]">
                          {test.subject} • {test.time} • {test.questions} questions
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Eligible Classes: {test.eligibleClasses} • Exam Date: {test.examDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {test.isEligible ? (
                        <button
                          onClick={() => navigate("/student/exam")}
                          className="text-[11px] px-3 py-1.5 rounded-full bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400 transition"
                        >
                          🔵 Start Test
                        </button>
                      ) : (
                        <span className="text-[11px] px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-600">
                          🔒 Not Eligible
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Olympiads */}
            <div className="rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">Upcoming Olympiads</h3>
                  <p className="text-[11px] text-slate-300/80">
                    Future exams ke liye registration yahan se karein
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scroll">
                {upcomingOlympiads.map((olymp) => (
                  <div
                    key={olymp.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3"
                  >
                    <div className="text-xs">
                      <p className="font-medium">{olymp.name}</p>
                      <p className="text-[11px] text-slate-300/85">
                        Subject: {olymp.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Reg closes: {olymp.regClose} • Event: {olymp.eventDate}
                      </p>
                      <p className="text-[11px] text-emerald-300 mt-0.5">
                        ⏰ {olymp.daysRemaining} days remaining
                      </p>
                    </div>
                    <div>
                      {olymp.status === "registered" ? (
                        <button className="text-[11px] px-3 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-medium">
                          ✅ Registered
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate("/student/register")}
                          className="text-[11px] px-3 py-1.5 rounded-full bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400 transition"
                        >
                          🔵 Register Now
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
            <div className="rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">Recent Test Results</h3>
                  <p className="text-[11px] text-slate-300/80">
                    Aapke latest exam attempts ka history
                  </p>
                </div>
                <button
                  onClick={() => navigate("/student/result")}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-slate-500 text-slate-200 hover:bg-slate-800 transition"
                >
                  🕒 Full History
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-[11px]">
                  <thead className="text-slate-300/80">
                    <tr className="border-b border-white/10">
                      <th className="py-2 pr-3 text-left font-medium">Test Name</th>
                      <th className="py-2 px-3 text-left font-medium">Subject</th>
                      <th className="py-2 px-3 text-left font-medium">Date</th>
                      <th className="py-2 px-3 text-left font-medium">Score</th>
                      <th className="py-2 pl-3 text-left font-medium">Status</th>
                      <th className="py-2 pl-3 text-left font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentResults.map((res) => (
                      <tr key={res.id} className="border-b border-white/5 hover:bg-slate-900">
                        <td className="py-2 pr-3">{res.name}</td>
                        <td className="py-2 px-3">{res.subject}</td>
                        <td className="py-2 px-3">{res.date}</td>
                        <td className="py-2 px-3">{res.score}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                            ✅ {res.status}
                          </span>
                        </td>
                        <td className="py-2 pl-3">
                          <button
                            onClick={() => navigate(`/student/result/${res.id}`)}
                            className="text-[11px] text-cyan-300 hover:text-cyan-200"
                          >
                            🔍 View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl p-4">
              <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>

              {/* Hidden file input for video */}
              <input
                type="file"
                accept="video/*"
                ref={fileInputRef}
                onChange={handleVideoFileChange}
                className="hidden"
              />

              <div className="space-y-2 text-xs">
                <button
                  onClick={handleVideoUploadClick}
                  className="w-full flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 hover:border-cyan-400/70 hover:bg-slate-900 transition"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      🎥
                    </span>
                    <span>
                      Upload Video
                      <p className="text-[10px] text-slate-300/80">
                        Educational ya solution videos upload karein
                      </p>
                    </span>
                  </span>
                  <span>→</span>
                </button>

                <button
                  onClick={() => navigate("/student/result")}
                  className="w-full flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 hover:border-cyan-400/70 hover:bg-slate-900 transition"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center">
                      🕒
                    </span>
                    <span>
                      Test History
                      <p className="text-[10px] text-slate-300/80">
                        Saare past test attempts dekhein
                      </p>
                    </span>
                  </span>
                  <span>→</span>
                </button>

                <button
                  onClick={() => navigate("/student/performance")}
                  className="w-full flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 hover:border-cyan-400/70 hover:bg-slate-900 transition"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center">
                      📈
                    </span>
                    <span>
                      Performance Analytics
                      <p className="text-[10px] text-slate-300/80">
                        Detailed progress & performance tracking
                      </p>
                    </span>
                  </span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-xl py-4 text-center text-[11px] text-slate-400">
          Student Portal © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
