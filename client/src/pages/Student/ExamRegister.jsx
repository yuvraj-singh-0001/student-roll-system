import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { examApi } from "../../api";

export default function ExamRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "" });
  const [registered, setRegistered] = useState(null);

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
        setRegistered(data.data);
        setForm({ name: "", email: "" });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const startExam = () => {
    if (registered?.studentId) {
      localStorage.setItem("examStudentId", registered.studentId);
      navigate("/student/exam");
    }
  };

  return (
    <div className="min-h-screen student-bg">
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/student")}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            ← Student Portal
          </button>
          <span className="text-slate-400">|</span>
          <h1 className="text-lg font-bold text-slate-800">Exam Registration</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden animate-scale-in">
          <div className="h-1 student-accent" />
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-fade-in">
                {error}
              </div>
            )}

            {registered ? (
              <div className="text-center space-y-6 animate-fade-in">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-3xl animate-scale-in">
                  ✓
                </div>
                <div className="p-5 bg-green-50 border border-green-200 rounded-xl text-left">
                  <p className="font-semibold text-green-800">Registration successful</p>
                  <p className="mt-2 text-slate-700">
                    Your <strong>Student ID</strong>:{" "}
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {registered.studentId}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Save this ID. You will need it to give the exam.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={startExam}
                    className="w-full py-3 px-4 student-accent text-white font-semibold rounded-xl hover:opacity-90 transition shadow-lg"
                  >
                    Start Exam →
                  </button>
                  <button
                    onClick={() => setRegistered(null)}
                    className="w-full py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
                  >
                    Register another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 student-accent text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-70 shadow-lg"
                >
                  {loading ? "Registering…" : "Register"}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/student")}
                className="text-slate-500 hover:text-slate-700 text-sm font-medium"
              >
                ← Back to Student Portal
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
