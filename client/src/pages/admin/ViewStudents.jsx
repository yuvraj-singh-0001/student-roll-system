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
    <div className="min-h-screen admin-bg">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin")} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition">← Admin</button>
            <span className="text-slate-300">|</span>
            <h1 className="text-lg font-bold text-slate-800">View Students</h1>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-6 animate-fade-in-up">
          <p className="text-slate-500 text-sm mb-4">Total: {students.length} · Auto-updating every 10s</p>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <input
              type="text"
              placeholder="Search by name, roll number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
            />
            <div className="flex gap-2">
              <button onClick={fetchStudents} className="py-2.5 px-5 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 transition">
                Refresh
              </button>
              <button onClick={() => navigate("/admin/add-student")} className="py-2.5 px-5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition">
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
                onClick={() => navigate("/admin/add-student")}
                className="mt-4 py-3 px-6 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 transition"
              >
                Add first student
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

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/admin")}
            className="py-2.5 px-5 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition"
          >
            ← Admin Panel
          </button>
        </div>
      </main>
    </div>
  );
}
