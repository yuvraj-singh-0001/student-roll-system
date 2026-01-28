import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { questionApi } from "../api";

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

  useEffect(() => {
    fetchQuestions();
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
        setSuccess("Question saved successfully.");
        resetForm();
        fetchQuestions();
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to add question");
    }
  };

  return (
    <div className="min-h-screen admin-bg">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              ← Admin
            </button>
            <span className="text-slate-300">|</span>
            <h1 className="text-lg font-bold text-slate-800">Add Questions</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm animate-fade-in">
            {success}
          </div>
        )}

        {/* Add question form — Submit option */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8 animate-fade-in-up">
          <div className="h-1 bg-slate-700" />
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Add new question</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Question number</label>
                <input
                  type="number"
                  name="questionNumber"
                  value={form.questionNumber}
                  onChange={handleChange}
                  min={1}
                  placeholder="e.g. 1"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Question text</label>
                <textarea
                  name="questionText"
                  value={form.questionText}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter question..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition resize-none"
                />
              </div>
              {OPTIONS.map((k) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Option {k}</label>
                  <input
                    type="text"
                    name={`opt${k}`}
                    value={form[`opt${k}`]}
                    onChange={handleChange}
                    placeholder={`Option ${k}`}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Correct answer</label>
                <select
                  name="correctAnswer"
                  value={form.correctAnswer}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition bg-white"
                >
                  {OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 transition shadow-md"
              >
                Submit question
              </button>
            </form>
          </div>
        </div>

        {/* Questions list */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in-up delay-1">
          <div className="h-1 bg-slate-600" />
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Total: {list.length} question{list.length !== 1 ? "s" : ""}
            </h2>
            {loading ? (
              <div className="py-12 text-center text-slate-500">Loading…</div>
            ) : list.length === 0 ? (
              <div className="py-12 text-center text-slate-500">No questions yet. Add one above.</div>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Question</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Correct</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((q) => (
                      <tr key={q._id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-medium text-slate-800">{q.questionNumber}</td>
                        <td className="px-4 py-3 text-slate-600 text-sm">{q.questionText?.slice(0, 80)}…</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
                            {q.correctAnswer}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
