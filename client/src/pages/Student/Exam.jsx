import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { questionApi, examApi } from "../../api";

const CONFIDENCE_OPTS = [
  { value: "full", label: "Full Confidence" },
  { value: "middle", label: "Middle Confidence" },
  { value: "low", label: "Low Confidence" },
];

export default function Exam() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("examStudentId");
    if (saved) setStudentId(saved);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await questionApi.exam();
        if (data.success && !cancelled) setQuestions(data.data);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Could not load questions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const q = questions[current];
  const aid = answers[q?.questionNumber];

  const updateAnswer = (questionNumber, payload) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: { ...prev[questionNumber], ...payload },
    }));
  };

  const markAttempted = (opt, conf) => {
    if (!q) return;
    updateAnswer(q.questionNumber, {
      status: "attempted",
      selectedAnswer: opt,
      confidenceLevel: conf || "middle",
    });
  };

  const markSkipped = () => {
    if (!q) return;
    updateAnswer(q.questionNumber, { status: "skipped", selectedAnswer: null, confidenceLevel: null });
  };

  const handleSubmit = async () => {
    if (!studentId.trim()) {
      setError("Enter your Student ID");
      return;
    }
    setError("");
    setSubmitLoading(true);
    try {
      const payload = questions.map((q) => {
        const a = answers[q.questionNumber] || {};
        return {
          questionNumber: q.questionNumber,
          status: a.status || "skipped",
          selectedAnswer: a.selectedAnswer || null,
          confidenceLevel: a.confidenceLevel || null,
        };
      });
      const { data } = await examApi.submit({ studentId: studentId.trim(), answers: payload });
      if (data.success) {
        navigate("/student/result", { state: data.data });
      }
    } catch (e) {
      setError(e.response?.data?.message || "Submit failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen student-bg flex flex-col items-center justify-center">
        <header className="absolute top-0 left-0 right-0 border-b border-indigo-100 bg-white/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => navigate("/student")} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">← Student</button>
            <span className="text-slate-400">|</span>
            <h1 className="text-lg font-bold text-slate-800">Online Exam</h1>
          </div>
        </header>
        <div className="animate-pulse-soft text-slate-500">Loading questions…</div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen student-bg flex flex-col items-center justify-center p-4">
        <header className="absolute top-0 left-0 right-0 border-b border-indigo-100 bg-white/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => navigate("/student")} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">← Student</button>
            <span className="text-slate-400">|</span>
            <h1 className="text-lg font-bold text-slate-800">Online Exam</h1>
          </div>
        </header>
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md animate-scale-in">
          <p className="text-slate-600 mb-4">No questions available. Ask admin to add questions first.</p>
          <button onClick={() => navigate("/student")} className="py-2.5 px-5 student-accent text-white rounded-xl font-semibold">
            ← Student Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen student-bg pb-20">
      <header className="border-b border-indigo-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/student")}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                ← Student
              </button>
              <span className="text-slate-400 hidden sm:inline">|</span>
              <h1 className="text-lg font-bold text-slate-800">Online Exam</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-600">Student ID</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. EXM101"
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-28 sm:w-32 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitLoading}
                className="py-2.5 px-5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-70 transition shadow-md"
              >
                {submitLoading ? "Submitting…" : "Submit exam"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-fade-in">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden animate-fade-in-up">
          <div className="h-1 student-accent" />
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center text-sm text-slate-500 mb-6">
              <span>Question {current + 1} of {questions.length}</span>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {questions.map((x) => (
                  <button
                    key={x.questionNumber}
                    onClick={() => setCurrent(questions.findIndex((r) => r.questionNumber === x.questionNumber))}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                      answers[x.questionNumber]?.status === "attempted"
                        ? "bg-green-500 text-white shadow"
                        : answers[x.questionNumber]?.status === "skipped"
                          ? "bg-amber-200 text-amber-900"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {x.questionNumber}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-lg font-semibold text-slate-800 mb-5">{q?.questionText}</p>
            <div className="space-y-2.5 mb-6">
              {(q?.options || []).map((o) => (
                <label
                  key={o.key}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    aid?.selectedAnswer === o.key
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="opt"
                    checked={aid?.selectedAnswer === o.key}
                    onChange={() => markAttempted(o.key, aid?.confidenceLevel || "middle")}
                    className="text-indigo-600"
                  />
                  <span className="font-medium text-slate-800"><span className="text-indigo-600">{o.key}.</span> {o.text}</span>
                </label>
              ))}
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-700 mb-2">Confidence level</p>
              <div className="flex flex-wrap gap-2">
                {CONFIDENCE_OPTS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => aid?.status === "attempted" && markAttempted(aid.selectedAnswer, c.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                      aid?.confidenceLevel === c.value
                        ? "student-accent text-white shadow"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={markSkipped}
                className="px-4 py-2.5 bg-amber-100 text-amber-800 rounded-xl font-semibold hover:bg-amber-200 transition"
              >
                Skip
              </button>
              {current > 0 && (
                <button
                  onClick={() => setCurrent((c) => c - 1)}
                  className="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition"
                >
                  Previous
                </button>
              )}
              {current < questions.length - 1 && (
                <button
                  onClick={() => setCurrent((c) => c + 1)}
                  className="px-4 py-2.5 student-accent text-white rounded-xl font-semibold hover:opacity-90 transition shadow"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
