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
      const { data } = await examApi.register(form);
      if (data.success) {
        const registered = data.data;

        localStorage.setItem("studentId", registered.studentId);
        localStorage.setItem("studentName", registered.name);
        localStorage.setItem("studentRoll", registered.rollNumber || "");
        localStorage.setItem("studentEmail", registered.email);

        navigate("/payment");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FFE6A3] rounded-full blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-[#FFEBD0] rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#FEECD5]/90 backdrop-blur-xl border-b border-[#FFE6A3] shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/student")}
                  className="group flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-[#FFF3C4] transition-all duration-200"
                >
                  <span className="text-lg group-hover:-translate-x-0.5 transition-transform">
                    ←
                  </span>
                  <span>Student Portal</span>
                </button>
                <div className="h-4 w-px bg-[#FFE6A3]" />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] flex items-center justify-center shadow">
                    <span className="text-gray-900 font-bold text-xs">R</span>
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-gray-900">
                      Exam Registration
                    </h1>
                    <p className="text-xs text-gray-600">
                      Step 1 · Fill your details
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/90 border border-[#FFE6A3] rounded-lg shadow-xs">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-gray-700">
                  Registration Open
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-md mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white/95 rounded-xl shadow-lg border border-[#FFE6A3] overflow-hidden animate-fade-in-up backdrop-blur">
            <div className="h-1 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00]" />

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
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] flex items-center justify-center shadow-lg">
                    <span className="text-xl text-gray-900">📝</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Student Registration
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Enter your details to continue to payment
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full px-4 py-3 border border-[#FFE1B5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCD2C] focus:border-[#FFCD2C] transition-all duration-200 group-hover:shadow-sm bg-[#FFFDF5]"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Roll Number (optional)
                    </label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={form.rollNumber}
                      onChange={handleChange}
                      placeholder="Enter your roll number (if any)"
                      className="w-full px-4 py-3 border border-[#FFE1B5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCD2C] focus:border-[#FFCD2C] transition-all duration-200 group-hover:shadow-sm bg-[#FFFDF5]"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      required
                      className="w-full px-4 py-3 border border-[#FFE1B5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCD2C] focus:border-[#FFCD2C] transition-all duration-200 group-hover:shadow-sm bg-[#FFFDF5]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full py-3.5 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 font-semibold rounded-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Payment</span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        →
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Back Link */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate("/student")}
                  className="group text-sm text-gray-700 hover:text-gray-900 transition-colors duration-200 flex items-center gap-1.5 mx-auto"
                >
                  <span className="group-hover:-translate-x-0.5 transition-transform duration-200">
                    ←
                  </span>
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
