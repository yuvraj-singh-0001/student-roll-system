import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ViewStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
    // Auto-refresh every 10 seconds to show live status
    const interval = setInterval(fetchStudents, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(false); // Keep UI responsive after first load
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

  const getStatusBadge = (emailStatus, emailOpenedAt) => {
    const statusConfig = {
      pending: { bg: "bg-gray-100", text: "text-gray-700", label: "📋 Pending", icon: "⏳" },
      sent: { bg: "bg-blue-100", text: "text-blue-700", label: "📤 Sent", icon: "📨" },
      opened: { bg: "bg-green-100", text: "text-green-700", label: "👁️ Opened", icon: "✅" },
      bounced: { bg: "bg-red-100", text: "text-red-700", label: "❌ Bounced", icon: "⚠️" },
    };

    const config = statusConfig[emailStatus] || statusConfig.pending;
    return (
      <div className="flex flex-col items-start gap-1">
        <span className={`px-3 py-1 ${config.bg} ${config.text} rounded-full text-sm font-semibold`}>
          {config.icon} {config.label}
        </span>
        {emailOpenedAt && (
          <span className="text-xs text-gray-500 ml-1">
            {new Date(emailOpenedAt).toLocaleString()}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
             View All Students
          </h1>
          <p className="text-gray-600 mt-2">Total Students: {students.length} | Auto-updating every 10 seconds</p>
        </div>

        {/* Controls Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-t-4 border-purple-500">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full sm:flex-1">
              <input
                type="text"
                placeholder="Search by name, roll number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={fetchStudents}
                className="flex-1 sm:flex-none py-3 px-6 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
              >
                 Refresh Now
              </button>
              <button
                onClick={() => navigate("/add-student")}
                className="flex-1 sm:flex-none py-3 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg transition"
              >
                 Add Student
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-gray-600 text-lg">
              {students.length === 0 ? "No students added yet" : "No results found"}
            </p>
            {students.length === 0 && (
              <button
                onClick={() => navigate("/add-student")}
                className="mt-4 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transition"
              >
                 Add First Student
              </button>
            )}
          </div>
        ) : (
          /* Students Table */
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-purple-500">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
                    <th className="px-6 py-4 text-left font-semibold">#</th>
                    <th className="px-6 py-4 text-left font-semibold">Roll Number</th>
                    <th className="px-6 py-4 text-left font-semibold">Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Email</th>
                    <th className="px-6 py-4 text-left font-semibold">Course</th>
                    <th className="px-6 py-4 text-left font-semibold">Email Status 📧</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student._id}
                      className="border-b hover:bg-purple-50 transition"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-700">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                          {student.rollNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                          {student.course}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(student.emailStatus, student.emailOpenedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="py-3 px-6 bg-gray-400 text-gray-800 font-semibold rounded-lg hover:bg-gray-500 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
