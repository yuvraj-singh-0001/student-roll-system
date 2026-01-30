import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { questionApi, examApi } from "../../api";

const CONFIDENCE_OPTS = [
  { value: "full", label: "Full Confidence", color: "from-green-500 to-emerald-500" },
  { value: "middle", label: "Middle Confidence", color: "from-yellow-500 to-amber-500" },
  { value: "low", label: "Low Confidence", color: "from-red-500 to-rose-500" },
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
  const [time, setTime] = useState(new Date());
  const [hoveredOption, setHoveredOption] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("examStudentId");
    if (saved) setStudentId(saved);
    
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 animate-pulse">Preparing your exam...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center max-w-md animate-fade-in-up">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-gray-500">❓</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Questions Available</h3>
            <p className="text-gray-600 mb-6">Please contact your administrator to add exam questions.</p>
            <button 
              onClick={() => navigate("/student")}
              className="group px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform duration-300">←</span>
              <span>Back to Student Portal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                    <span className="text-white font-bold text-xs">E</span>
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-gray-900">Online Exam</h1>
                    <p className="text-xs text-gray-500">Question {current + 1} of {questions.length}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-xs">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-700">Exam Active</span>
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

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 text-red-700 rounded-lg text-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Panel - Question & Options */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                
                <div className="p-6">
                  {/* Question Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Question {current + 1}</h2>
                      <p className="text-xs text-gray-500">Select your answer below</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Progress</div>
                      <div className="text-lg font-bold text-gray-900">{current + 1}/{questions.length}</div>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <p className="text-gray-900 font-medium leading-relaxed">{q?.questionText}</p>
                  </div>

                  {/* Options */}
                  <div className="space-y-3 mb-6">
                    {(q?.options || []).map((o) => (
                      <label
                        key={o.key}
                        onMouseEnter={() => setHoveredOption(o.key)}
                        onMouseLeave={() => setHoveredOption(null)}
                        className={`group flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                          aid?.selectedAnswer === o.key
                            ? "border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-sm"
                            : hoveredOption === o.key
                            ? "border-gray-300 bg-gray-50 shadow-sm"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          aid?.selectedAnswer === o.key
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300 group-hover:border-blue-300"
                        }`}>
                          {aid?.selectedAnswer === o.key && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${
                              aid?.selectedAnswer === o.key ? "text-blue-600" : "text-gray-700"
                            }`}>
                              {o.key}.
                            </span>
                            <span className="text-gray-800">{o.text}</span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="opt"
                          checked={aid?.selectedAnswer === o.key}
                          onChange={() => markAttempted(o.key, aid?.confidenceLevel || "middle")}
                          className="sr-only"
                        />
                      </label>
                    ))}
                  </div>

                  {/* Confidence Level */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Confidence Level</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {CONFIDENCE_OPTS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => aid?.status === "attempted" && markAttempted(aid.selectedAnswer, c.value)}
                          className={`group px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                            aid?.confidenceLevel === c.value
                              ? `bg-gradient-to-br ${c.color} text-white shadow-md`
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={markSkipped}
                      className="group px-4 py-2.5 bg-gradient-to-br from-amber-100 to-orange-100 text-amber-800 font-medium rounded-lg hover:shadow transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <span>⏭️</span>
                      <span>Skip Question</span>
                    </button>
                    <div className="flex-1 flex justify-end gap-2">
                      {current > 0 && (
                        <button
                          onClick={() => setCurrent((c) => c - 1)}
                          className="group px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:shadow transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
                        >
                          <span className="group-hover:-translate-x-0.5 transition-transform duration-200">←</span>
                          <span>Previous</span>
                        </button>
                      )}
                      {current < questions.length - 1 && (
                        <button
                          onClick={() => setCurrent((c) => c + 1)}
                          className="group px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
                        >
                          <span>Next</span>
                          <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Progress & Submit */}
            <div className="space-y-6">
              {/* Student ID & Submit */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                <div className="p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Exam Information</h3>
                  
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      onBlur={() => studentId && localStorage.setItem("examStudentId", studentId)}
                      placeholder="Enter your student ID"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitLoading}
                    className="group w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Exam</span>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">✓</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Question Navigator */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Question Navigator</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((x) => {
                      const answer = answers[x.questionNumber];
                      const isCurrent = current === questions.findIndex((r) => r.questionNumber === x.questionNumber);
                      
                      let bgClass = "bg-gray-100 text-gray-600";
                      if (isCurrent) bgClass = "bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md";
                      else if (answer?.status === "attempted") bgClass = "bg-gradient-to-br from-green-100 to-emerald-100 text-green-700";
                      else if (answer?.status === "skipped") bgClass = "bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700";
                      
                      return (
                        <button
                          key={x.questionNumber}
                          onClick={() => setCurrent(questions.findIndex((r) => r.questionNumber === x.questionNumber))}
                          className={`w-full aspect-square rounded-lg text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${bgClass}`}
                        >
                          {x.questionNumber}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-gradient-to-br from-green-100 to-emerald-100"></div>
                        <span className="text-gray-600">Attempted</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-gradient-to-br from-amber-100 to-orange-100"></div>
                        <span className="text-gray-600">Skipped</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-500 to-purple-500"></div>
                        <span className="text-gray-600">Current</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-gray-100"></div>
                        <span className="text-gray-600">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-gray-800 to-gray-900"></div>
                <div className="p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Progress Stats</h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {Object.values(answers).filter(a => a?.status === "attempted").length}
                      </div>
                      <div className="text-xs text-green-600">Attempted</div>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <div className="text-lg font-bold text-amber-600">
                        {Object.values(answers).filter(a => a?.status === "skipped").length}
                      </div>
                      <div className="text-xs text-amber-600">Skipped</div>
                    </div>
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <div className="text-lg font-bold text-gray-600">
                        {questions.length - Object.keys(answers).length}
                      </div>
                      <div className="text-xs text-gray-600">Pending</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/90 py-4 mt-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">E</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Online Exam</span>
                </div>
                <div className="hidden md:flex items-center gap-1 text-xs text-gray-500">
                  <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"></div>
                  <span>Time: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-600">Questions: {questions.length}</span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-600">Answered: {Object.values(answers).filter(a => a?.status === "attempted").length}</span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-600">Remaining: {questions.length - Object.keys(answers).length}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}