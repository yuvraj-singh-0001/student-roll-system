import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { questionApi } from "../../api";

const OPTIONS = ["A", "B", "C", "D"];

export default function AdminQuestions() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    questionNumber: "",
    questionText: "",
    optA: "",
    optB: "",
    optC: "",
    optD: "",
    correctAnswer: "A",
  });
  const [hoveredRow, setHoveredRow] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    fetchQuestions();
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data } = await questionApi.all();
      if (data.success) setList(data.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      questionNumber: "",
      questionText: "",
      optA: "",
      optB: "",
      optC: "",
      optD: "",
      correctAnswer: "A",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const options = [
      { key: "A", text: form.optA },
      { key: "B", text: form.optB },
      { key: "C", text: form.optC },
      { key: "D", text: form.optD },
    ];
    if (!form.questionNumber || !form.questionText || options.some((o) => !o.text?.trim())) {
      setError("Question number, question text, and all four options (A–D) are required.");
      return;
    }
    try {
      const { data } = await questionApi.add({
        questionNumber: Number(form.questionNumber),
        questionText: form.questionText.trim(),
        options,
        correctAnswer: form.correctAnswer,
      });
      if (data.success) {
        setSuccess("Question added successfully!");
        resetForm();
        fetchQuestions();
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to add question");
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
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/admin")}
                  className="group flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <span className="text-lg group-hover:-translate-x-0.5 transition-transform">←</span>
                  <span>Admin Dashboard</span>
                </button>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow">
                    <span className="text-white font-bold text-xs">A</span>
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-gray-900">Manage Questions</h1>
                    <p className="text-xs text-gray-500">Add & view exam questions</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-xs">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-700">System Online</span>
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

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Side - Add Question Form */}
            <div>
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-xl text-white">➕</span>
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Add New Question</h2>
                      <p className="text-xs text-gray-500">Create exam questions</p>
                    </div>
                  </div>

                  {/* Success/Error Messages */}
                  {error && (
                    <div className="mb-4 p-3 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 text-red-700 rounded-lg text-xs animate-fade-in">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">⚠️</span>
                        <span>{error}</span>
                      </div>
                    </div>
                  )}
                  
                  {success && (
                    <div className="mb-4 p-3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 text-green-700 rounded-lg text-xs animate-fade-in">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">✅</span>
                        <span>{success}</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <label className="block text-xs font-medium text-gray-700 mb-2">Question #</label>
                        <input
                          type="number"
                          name="questionNumber"
                          value={form.questionNumber}
                          onChange={handleChange}
                          min={1}
                          placeholder="e.g. 1"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-xs font-medium text-gray-700 mb-2">Correct Answer</label>
                        <select
                          name="correctAnswer"
                          value={form.correctAnswer}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        >
                          {OPTIONS.map((o) => (
                            <option key={o} value={o}>Option {o}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-xs font-medium text-gray-700 mb-2">Question Text</label>
                      <textarea
                        name="questionText"
                        value={form.questionText}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Enter question text here..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      />
                    </div>

                    <div className="space-y-3">
                      {OPTIONS.map((k) => (
                        <div key={k} className="group">
                          <label className="block text-xs font-medium text-gray-700 mb-2">Option {k}</label>
                          <input
                            type="text"
                            name={`opt${k}`}
                            value={form[`opt${k}`]}
                            onChange={handleChange}
                            placeholder={`Enter option ${k} text`}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="group w-full py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <span>Add Question</span>
                      <span className="group-hover:translate-x-0.5 transition-transform duration-300">→</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
                  <div className="text-lg font-bold text-gray-900">{list.length}</div>
                  <div className="text-xs text-gray-500">Questions</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
                  <div className="text-lg font-bold text-blue-600">MCQ</div>
                  <div className="text-xs text-gray-500">Format</div>
                </div>
              </div>
            </div>

            {/* Right Side - Questions List */}
            <div>
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-xl text-white">📋</span>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900">Question Bank</h2>
                        <p className="text-xs text-gray-500">
                          {list.length} question{list.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={fetchQuestions}
                      className="group px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs font-medium rounded-lg hover:shadow transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5"
                    >
                      <span className="group-hover:rotate-180 transition-transform duration-300 text-xs">↻</span>
                      <span>Refresh</span>
                    </button>
                  </div>

                  {loading ? (
                    <div className="py-12 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-600">Loading questions...</p>
                    </div>
                  ) : list.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-2xl text-gray-500">❓</span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No Questions Yet</h3>
                      <p className="text-xs text-gray-500">Add your first question using the form</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">#</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Question</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Correct</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {list.map((q) => (
                            <tr
                              key={q._id}
                              onMouseEnter={() => setHoveredRow(q._id)}
                              onMouseLeave={() => setHoveredRow(null)}
                              className={`group transition-all duration-200 ${
                                hoveredRow === q._id 
                                  ? 'bg-blue-50/50' 
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="text-xs font-semibold text-gray-700">{q.questionNumber}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-xs text-gray-600 truncate max-w-[200px]">{q.questionText}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  q.correctAnswer === 'A' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                  q.correctAnswer === 'B' ? 'bg-green-100 text-green-700 border border-green-200' :
                                  q.correctAnswer === 'C' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                  'bg-purple-100 text-purple-700 border border-purple-200'
                                }`}>
                                  {q.correctAnswer}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Table Footer */}
                  {list.length > 0 && (
                    <div className="border-t border-gray-100 p-3 bg-gray-50/50 mt-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          Showing {Math.min(10, list.length)} of {list.length}
                        </span>
                        <div className="flex items-center gap-1">
                          <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white rounded transition-all duration-200">
                            ←
                          </button>
                          <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-700 font-medium">
                            1
                          </span>
                          <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white rounded transition-all duration-200">
                            →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-900 mb-3">Answer Key Colors</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
                    <span className="text-gray-600">Option A</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
                    <span className="text-gray-600">Option B</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-amber-100 border border-amber-200"></div>
                    <span className="text-gray-600">Option C</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-purple-100 border border-purple-200"></div>
                    <span className="text-gray-600">Option D</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/admin")}
              className="group px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:shadow transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5 mx-auto"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform duration-200">←</span>
              <span>Back to Admin Dashboard</span>
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/90 py-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">A</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Question Management</span>
                </div>
                <div className="hidden md:flex items-center gap-1 text-xs text-gray-500">
                  <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"></div>
                  <span>Updated: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
    </div>
  );
}