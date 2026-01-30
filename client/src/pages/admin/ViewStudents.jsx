import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ViewStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [time, setTime] = useState(new Date());
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchStudents();
    const timer = setInterval(() => setTime(new Date()), 1000);
    const interval = setInterval(fetchStudents, 10000);
    return () => {
      clearInterval(timer);
      clearInterval(interval);
    };
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(false);
      const response = await axios.get("http://localhost:5000/api/student/all");
      if (response.data.success) {
        setStudents(response.data.data);
        setError("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching students");
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (emailStatus, emailOpenedAt) => {
    const statusConfig = {
      pending: { 
        bg: "bg-gray-100", 
        text: "text-gray-700", 
        label: "Pending", 
        icon: "⏳",
        dot: "bg-gray-400"
      },
      sent: { 
        bg: "bg-blue-100", 
        text: "text-blue-700", 
        label: "Sent", 
        icon: "📨",
        dot: "bg-blue-500"
      },
      opened: { 
        bg: "bg-green-100", 
        text: "text-green-700", 
        label: "Opened", 
        icon: "✅",
        dot: "bg-green-500"
      },
      bounced: { 
        bg: "bg-red-100", 
        text: "text-red-700", 
        label: "Bounced", 
        icon: "⚠️",
        dot: "bg-red-500"
      },
    };

    const config = statusConfig[emailStatus] || statusConfig.pending;
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 ${config.dot} rounded-full`}></div>
        <span className={`px-2 py-1 ${config.bg} ${config.text} rounded text-xs font-medium`}>
          {config.icon} {config.label}
        </span>
      </div>
    );
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
  };

  const closeDetailsModal = () => {
    setSelectedStudent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Compact Header */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/admin")}
                  className="group flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <span className="text-lg group-hover:-translate-x-0.5 transition-transform">←</span>
                  <span>Admin</span>
                </button>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow">
                    <span className="text-white font-bold text-xs">A</span>
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-gray-900">Student Management</h1>
                    <p className="text-xs text-gray-500">6 students per page</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-xs">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-700">Live</span>
                </div>
                <div className="px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg shadow-sm">
                  <div className="text-xs font-medium">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Compact Search and Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">Students Directory</h2>
                <p className="text-xs text-gray-500">
                  Page {currentPage} of {totalPages} • {filteredStudents.length} total students
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={fetchStudents}
                    className="group px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm font-medium rounded-lg hover:shadow transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5"
                  >
                    <span className="group-hover:rotate-180 transition-transform duration-300 text-xs">↻</span>
                    <span>Refresh</span>
                  </button>
                  <button 
                    onClick={() => navigate("/admin/add-student")}
                    className="group px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:shadow transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5"
                  >
                    <span className="text-sm">+</span>
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 text-red-700 rounded-lg text-xs animate-fade-in">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center animate-fade-in-up">
              <div className="w-12 h-12 mx-auto mb-3 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Loading Students</h3>
              <p className="text-xs text-gray-500">Fetching data...</p>
            </div>
          ) : currentStudents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center animate-fade-in-up">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-xl text-gray-500">👤</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {students.length === 0 ? "No Students" : "No Results"}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {students.length === 0 ? "Add your first student" : "Try different search"}
              </p>
              {students.length === 0 && (
                <button
                  onClick={() => navigate("/admin/add-student")}
                  className="group px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm font-medium rounded-lg hover:shadow transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5 mx-auto"
                >
                  <span>+</span>
                  <span>Add First Student</span>
                </button>
              )}
            </div>
          ) : (
            /* Compact Students Table - Show only 6 */
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
              <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Roll No.
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Student Details
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentStudents.map((student, index) => (
                      <tr
                        key={student._id}
                        onMouseEnter={() => setHoveredRow(student._id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        className={`group transition-all duration-200 ${
                          hoveredRow === student._id 
                            ? 'bg-blue-50/50' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="text-xs font-semibold text-gray-700">
                            {startIndex + index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-semibold">
                            {student.rollNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[180px]">{student.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded text-xs font-semibold">
                            {student.course}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(student.emailStatus, student.emailOpenedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="group px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium rounded-lg hover:shadow transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1"
                          >
                            <span>View</span>
                            <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="border-t border-gray-100 p-3 bg-gray-50/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    Showing {Math.min(itemsPerPage, currentStudents.length)} of {filteredStudents.length} students
                  </span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>
                    <span className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-700 font-medium">
                      {currentPage}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded font-medium">
                      {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compact Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/admin")}
              className="group px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:shadow transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5 mx-auto"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform duration-200">←</span>
              <span>Back to Admin</span>
            </button>
          </div>
        </main>

        {/* Compact Footer */}
        <footer className="border-t border-gray-200 bg-white/90 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">A</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Students v2.0</span>
                </div>
                <div className="hidden md:flex items-center gap-1 text-xs text-gray-500">
                  <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"></div>
                  <span>Page {currentPage} • Updated: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Export
                </button>
                <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Docs
                </button>
                <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Report
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Student Details Modal - User Interface Style */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-fade-in-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Student Details</h2>
                <p className="text-sm text-gray-300">Complete student information</p>
              </div>
              <button
                onClick={closeDetailsModal}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
              >
                <span className="text-xl font-bold">×</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 p-6">
              <div className="space-y-6">
                {/* Student Profile Section */}
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white">👤</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedStudent.name}</h3>
                    <p className="text-sm text-gray-600">{selectedStudent.email}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold rounded-full">
                        {selectedStudent.rollNumber}
                      </span>
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                        {selectedStudent.course}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-blue-500">📧</span>
                      Email Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${
                          selectedStudent.emailStatus === 'opened' ? 'text-green-600' :
                          selectedStudent.emailStatus === 'sent' ? 'text-blue-600' :
                          selectedStudent.emailStatus === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {selectedStudent.emailStatus?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Opened:</span>
                        <span className="font-medium text-gray-900">
                          {selectedStudent.emailOpenedAt 
                            ? new Date(selectedStudent.emailOpenedAt).toLocaleString()
                            : 'Not opened yet'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-green-500">📊</span>
                      Academic Stats
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exams Taken:</span>
                        <span className="font-medium text-gray-900">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Score:</span>
                        <span className="font-medium text-green-600">78.5%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-purple-500">📅</span>
                      Account Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Joined:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(selectedStudent.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Status:</span>
                        <span className="font-medium text-green-600">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-amber-500">⚡</span>
                      Quick Actions
                    </h4>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium rounded-lg hover:shadow transition-all duration-200">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-lg hover:shadow transition-all duration-200">
                        Message
                      </button>
                      <button className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-medium rounded-lg hover:shadow transition-all duration-200">
                        Deactivate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-gray-500">📝</span>
                    Recent Activity
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Last Exam Taken:</span>
                      <span className="font-medium text-gray-900">Mathematics Final</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Score:</span>
                      <span className="font-medium text-green-600">85%</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Last Login:</span>
                      <span className="font-medium text-gray-900">Today, 14:30</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeDetailsModal}
                className="px-5 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm font-semibold rounded-lg hover:shadow transition-all duration-200"
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