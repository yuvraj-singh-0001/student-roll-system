import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

export default function ViewStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchStudents({ showLoader: true });
    const interval = setInterval(() => fetchStudents({ showLoader: false }), 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchStudents = async (options = {}) => {
    const showLoader = options.showLoader ?? students.length === 0;
    try {
      if (showLoader) setLoading(true);
      const response = await API.get("/student/all");
      if (response.data.success) {
        setStudents(response.data.data);
        setError("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching students");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const displayValue = (value, fallback = "-") => {
    if (value === null || value === undefined || value === "") return fallback;
    return value;
  };

  const getInitial = (value) => {
    const text = String(value || "").trim();
    return text ? text.charAt(0).toUpperCase() : "S";
  };

  const searchValue = searchTerm.toLowerCase();
  const filteredStudents = students.filter((student) => {
    const name = String(student.name || "").toLowerCase();
    const number = String(student.rollNumber || student.mobile || "").toLowerCase();
    const studentClass = String(student.class || student.course || "").toLowerCase();
    const studentId = String(student._id || "").toLowerCase();
    return (
      name.includes(searchValue) ||
      number.includes(searchValue) ||
      studentClass.includes(searchValue) ||
      studentId.includes(searchValue)
    );
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setActionError("");
  };

  const closeDetailsModal = () => {
    setSelectedStudent(null);
    setActionError("");
  };

  const handleDeleteStudent = async (student) => {
    if (!student?._id) return;
    const confirmed = window.confirm(
      `Delete ${student.name || "this student"}? This cannot be undone.`
    );
    if (!confirmed) return;
    setDeletingId(student._id);
    setActionError("");
    try {
      await API.delete(`/student/${student._id}`);
      setStudents((prev) => prev.filter((s) => s._id !== student._id));
      if (selectedStudent?._id === student._id) {
        closeDetailsModal();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || "Error deleting student");
    } finally {
      setDeletingId(null);
    }
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
        

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Compact Search and Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">Students Directory</h2>
                <p className="text-xs text-gray-500">
                  Page {currentPage} of {totalPages} | {filteredStudents.length} total students
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
                  {/* <span className="absolute left-3 top-2.5 text-gray-400 text-sm"></span> */}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => fetchStudents({ showLoader: true })}
                    className="group px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm font-medium rounded-lg hover:shadow transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5"
                  >
                    <span className="group-hover:rotate-180 transition-transform duration-300 text-xs"></span>
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
                <span className="text-sm">error</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {actionError && (
            <div className="mb-4 p-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-amber-800 rounded-lg text-xs animate-fade-in">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">!</span>
                <span>{actionError}</span>
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
                <span className="text-xl text-gray-500">00000</span>
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
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                        Number
                      </th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
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
                        <td className="px-3 py-2">
                          <div className="text-[11px] font-semibold text-gray-700">
                            {startIndex + index + 1}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            title={displayValue(student._id)}
                            className="block max-w-[140px] truncate text-[11px] font-mono text-gray-700"
                          >
                            {displayValue(student._id)}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm font-medium text-gray-900">
                            {displayValue(student.name)}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs font-semibold text-gray-700">
                            {displayValue(student.rollNumber || student.mobile)}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs font-semibold text-gray-700">
                            {displayValue(student.class || student.course)}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="px-2.5 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[11px] font-semibold rounded-md hover:shadow transition-all duration-200"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student)}
                              disabled={deletingId === student._id}
                              className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[11px] font-semibold rounded-md hover:shadow transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {deletingId === student._id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
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
                      className="p-1.5 text-gray-900 hover:text-gray-700 hover:bg-white rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous 
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
                      className="p-1.5 text-gray-900 hover:text-gray-700 hover:bg-white rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next 
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
              <span className="group-hover:-translate-x-0.5 transition-transform duration-200"></span>
              <span>Back to Admin</span>
            </button>
          </div>
        </main>

        {/* Compact Footer */}
        
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
                <span className="text-xl font-bold">X</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow">
                    <span className="text-lg text-white">{getInitial(selectedStudent.name)}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {displayValue(selectedStudent.name)}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Student ID: {displayValue(selectedStudent._id)}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-semibold text-gray-900">
                      {displayValue(selectedStudent.name)}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">Number</p>
                    <p className="font-semibold text-gray-900">
                      {displayValue(selectedStudent.rollNumber || selectedStudent.mobile)}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">Class</p>
                    <p className="font-semibold text-gray-900">
                      {displayValue(selectedStudent.class || selectedStudent.course)}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">Student ID</p>
                    <p className="font-semibold text-gray-900 break-all">
                      {displayValue(selectedStudent._id)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end">
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

