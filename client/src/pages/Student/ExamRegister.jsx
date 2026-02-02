import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { examApi } from "../../api";

export default function ExamRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    rollNumber: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // API: yahan se studentId milega
      const { data } = await examApi.register(form);
      if (data.success) {
        const registered = data.data; // { studentId, name, email, rollNumber }

        // exam ke liye studentId store
        localStorage.setItem("studentId", registered.studentId);
        localStorage.setItem("studentName", registered.name);
        localStorage.setItem("studentRoll", registered.rollNumber || "");
        localStorage.setItem("studentEmail", registered.email);

        // payment flow ke liye tumhara pehle se existing userId already hoga (login time set)
        // isliye payment se pehle sirf navigate
        navigate("/payment");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/student")}
                  className="group flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <span className="text-lg group-hover:-translate-x-0.5 transition-transform">←</span>
                  <span>Student Portal</span>
                </button>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow">
                    <span className="text-white font-bold text-xs">R</span>
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-gray-900">Exam Registration</h1>
                    <p className="text-xs text-gray-500">Step 1 · Fill your details</p>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-xs">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">Registration Open</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-md mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

            <div className="p-6 sm:p-8">
              {/* Error */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 text-red-700 rounded-lg text-sm animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-xl text-white">📝</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Student Registration</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your details to continue to payment
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:shadow-sm"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roll Number (optional)
                    </label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={form.rollNumber}
                      onChange={handleChange}
                      placeholder="Enter your roll number (if any)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:shadow-sm"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:shadow-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full py-3.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Payment</span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </>
                  )}
                </button>
              </form>

              {/* Back Link */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate("/student")}
                  className="group text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center gap-1.5 mx-auto"
                >
                  <span className="group-hover:-translate-x-0.5 transition-transform duration-200">←</span>
                  <span>Back to Student Portal</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
