import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { analysisApi } from "../../api";

export default function ExamDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchDashboard();
    return () => clearInterval(timer);
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

  const fetchStudentDetails = async (studentId) => {
    try {
      setDetailsLoading(true);
      setDetailsError("");
      const { data: res } = await analysisApi.studentExamDetails(studentId);
      if (res.success) {
        setStudentDetails(res.data);
      }
    } catch (e) {
      setDetailsError(e.response?.data?.message || "Failed to load student details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    fetchStudentDetails(student.studentId);
  };

  const closeDetailsModal = () => {
    setSelectedStudent(null);
    setStudentDetails([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 animate-pulse">Loading exam analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center max-w-md animate-fade-in-up">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-red-600">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to Load Data</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => navigate("/admin")}
              className="group px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
              <span>Back to Admin Panel</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { studentWise: st, questionWise: qw, confidenceWise: cw, totals, totalStudents, totalQuestions } = data || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/admin")}
                  className="group flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                  <span className="text-lg group-hover:-translate-x-0.5 transition-transform">←</span>
                  <span>Admin Dashboard</span>
                </button>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Exam Analytics</h1>
                    <p className="text-xs text-gray-500">Detailed exam reports & insights</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">System Online</span>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl shadow-lg">
                  <div className="text-sm font-medium">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Students Attempted", value: totalStudents ?? 0, icon: "👥", color: "from-blue-500 to-cyan-500" },
              { label: "Total Questions", value: totalQuestions ?? 0, icon: "📋", color: "from-purple-500 to-pink-500" },
              { label: "Attempted", value: totals?.attempted ?? 0, icon: "✓", color: "from-green-500 to-emerald-500" },
              { label: "Skipped", value: totals?.skipped ?? 0, icon: "⏭️", color: "from-orange-500 to-amber-500" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="group relative bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-lg text-white">{stat.icon}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
            ))}
          </div>

          {/* Performance Metrics */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Correct vs Wrong */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Analysis</h2>
                <div className="flex gap-6">
                  <div className="flex-1 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                    <div className="text-3xl font-bold text-green-700 mb-2">{totals?.correct ?? 0}</div>
                    <div className="text-sm font-medium text-green-600">Correct Answers</div>
                    <div className="mt-3 w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"></div>
                  </div>
                  <div className="flex-1 p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100 text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                    <div className="text-3xl font-bold text-red-700 mb-2">{totals?.wrong ?? 0}</div>
                    <div className="text-sm font-medium text-red-600">Wrong Answers</div>
                    <div className="mt-3 w-16 h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-full mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence Impact */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Confidence Impact</h2>
                <div className="space-y-3">
                  {["full", "middle", "low"].map((level) => (
                    <div key={level} className="group flex items-center justify-between p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-sm transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${
                          level === 'full' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                          level === 'middle' ? 'bg-gradient-to-br from-yellow-500 to-amber-500' :
                          'bg-gradient-to-br from-red-500 to-rose-500'
                        } flex items-center justify-center`}>
                          <span className="text-white text-xs">{level === 'full' ? '✓' : level === 'middle' ? '~' : '?'}</span>
                        </div>
                        <span className="font-medium text-gray-700 capitalize">{level}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-green-600 font-medium">{cw?.[level]?.correct ?? 0}✓</span>
                        {" "}/{" "}
                        <span className="text-red-600 font-medium">{cw?.[level]?.wrong ?? 0}✗</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Question-wise Analysis */}
          {qw?.mostAttempted != null && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Question-wise Analysis</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="group p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                    <div className="text-sm text-gray-600 mb-2">Most Attempted</div>
                    <div className="text-xl font-bold text-gray-900">Q{qw.mostAttempted?.questionNumber}</div>
                    <div className="text-sm text-blue-600 font-medium">{qw.mostAttempted?.attemptCount} attempts</div>
                  </div>
                  <div className="group p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                    <div className="text-sm text-gray-600 mb-2">Least Attempted</div>
                    <div className="text-xl font-bold text-gray-900">Q{qw.leastAttempted?.questionNumber}</div>
                    <div className="text-sm text-amber-600 font-medium">{qw.leastAttempted?.attemptCount} attempts</div>
                  </div>
                  <div className="group p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                    <div className="text-sm text-gray-600 mb-2">Most Wrong</div>
                    <div className="text-xl font-bold text-gray-900">Q{qw.mostWrong?.questionNumber}</div>
                    <div className="text-sm text-red-600 font-medium">{qw.mostWrong?.wrongCount} wrong</div>
                  </div>
                  <div className="group p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                    <div className="text-sm text-gray-600 mb-2">Most Confusing</div>
                    <div className="text-xl font-bold text-gray-900">
                      {qw.mostConfusing?.length ? `Q${qw.mostConfusing[0]?.questionNumber}` : "—"}
                    </div>
                    <div className="text-sm text-purple-600 font-medium">
                      {qw.mostConfusing?.length ? `${qw.mostConfusing[0]?.wrongCount} wrong` : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Student-wise Results Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <div className="h-1 bg-gradient-to-r from-gray-800 to-gray-900"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Student-wise Results</h2>
                  <p className="text-sm text-gray-500 mt-1">Detailed performance of all students</p>
                </div>
                <button
                  onClick={fetchDashboard}
                  className="group px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span className="group-hover:rotate-180 transition-transform duration-300">↻</span>
                  <span>Refresh</span>
                </button>
              </div>

              {Array.isArray(st) && st.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Attempted</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Skipped</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Correct / Wrong</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {st.map((student, index) => (
                        <tr 
                          key={student.studentId}
                          onMouseEnter={() => setHoveredRow(student.studentId)}
                          onMouseLeave={() => setHoveredRow(null)}
                          className={`group transition-all duration-300 ${
                            hoveredRow === student.studentId 
                              ? 'bg-gradient-to-r from-blue-50/50 to-transparent transform scale-[1.002]' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-4 py-3 font-mono font-medium text-gray-900">{student.studentId}</td>
                          <td className="px-4 py-3 text-gray-700">{student.name}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              {student.attempted}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              {student.skipped}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${
                              student.totalScore >= 80 ? 'text-green-600' :
                              student.totalScore >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {student.totalScore}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 font-medium">{student.correct}✓</span>
                              <span className="text-gray-400">/</span>
                              <span className="text-red-600 font-medium">{student.wrong}✗</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="group relative px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                            >
                              <span>View Details</span>
                              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-2xl text-gray-500">📊</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Exam Attempts Yet</h3>
                  <p className="text-gray-500">Students haven't attempted any exams yet.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <span className="font-medium text-gray-900">Exam Analytics v2.0</span>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>Last updated: Today, {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300">
                  Export Report
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300">
                  Documentation
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300">
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Exam Details - {selectedStudent.name}</h2>
                <p className="text-sm text-gray-300">Student ID: {selectedStudent.studentId}</p>
              </div>
              <button
                onClick={closeDetailsModal}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300"
              >
                <span className="text-xl font-bold">×</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {detailsLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600">Loading detailed results...</p>
                </div>
              ) : detailsError ? (
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200 p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                    <span className="text-2xl text-red-600">⚠️</span>
                  </div>
                  <p className="text-red-700 font-medium">{detailsError}</p>
                </div>
              ) : studentDetails.length > 0 ? (
                <div className="space-y-4">
                  {studentDetails.map((detail, idx) => (
                    <div
                      key={idx}
                      className={`group rounded-xl border-2 p-5 transition-all duration-300 hover:shadow-lg ${
                        detail.isCorrect
                          ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100"
                          : detail.status === "skipped"
                          ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100"
                          : "border-red-300 bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              detail.isCorrect
                                ? "bg-gradient-to-br from-green-500 to-emerald-500"
                                : detail.status === "skipped"
                                ? "bg-gradient-to-br from-amber-500 to-orange-500"
                                : "bg-gradient-to-br from-red-500 to-rose-500"
                            }`}>
                              <span className="text-white font-bold text-lg">
                                {detail.isCorrect ? '✓' : detail.status === "skipped" ? '⏭️' : '✗'}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">Question {detail.questionNumber}</h3>
                              <p className="text-sm text-gray-600">{detail.question}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${
                            detail.isCorrect
                              ? "bg-green-200 text-green-800"
                              : detail.status === "skipped"
                              ? "bg-amber-200 text-amber-800"
                              : "bg-red-200 text-red-800"
                          }`}>
                            {detail.status === "skipped" ? "Skipped" : detail.isCorrect ? "Correct" : "Wrong"}
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm border-t border-gray-300/50 pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Student's Answer:</span>
                            <span className="font-medium text-gray-900">{detail.studentAnswer || "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Correct Answer:</span>
                            <span className="font-medium text-green-700">{detail.correctAnswer}</span>
                          </div>
                        </div>
                        {detail.status !== "skipped" && (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Marks:</span>
                              <span className="font-bold text-gray-900">{detail.marks}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Confidence:</span>
                              <span className={`font-medium capitalize ${
                                detail.confidenceLevel === 'full' ? 'text-green-600' :
                                detail.confidenceLevel === 'middle' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {detail.confidenceLevel || "-"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-2xl text-gray-500">📄</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Exam Details Found</h3>
                  <p className="text-gray-500">No exam attempt details available for this student.</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeDetailsModal}
                className="px-6 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}