import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { questionApi, examApi } from "../../api";

const CONFIDENCE_OPTS = [
  { value: "high", label: "High Confidence", color: "from-green-500 to-emerald-500" },
  { value: "mid", label: "Medium Confidence", color: "from-yellow-500 to-amber-500" },
  { value: "low", label: "Low Confidence", color: "from-red-500 to-rose-500" },
];

const TYPE_LABELS = {
  simple: "Simple",
  multiple: "Multiple",
  confidence: "Confidence",
  branch_parent: "Branch Choice",
  branch_child: "Branch Question",
};

export default function Exam() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [examCode, setExamCode] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [examList, setExamList] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [time, setTime] = useState(new Date());
  const [hoveredOption, setHoveredOption] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("examStudentId") || localStorage.getItem("studentId");
    if (saved) setStudentId(saved);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (examCode) return;
    let cancelled = false;
    setExamLoading(true);
    setExamError("");

    (async () => {
      try {
        const { data } = await examApi.list();
        if (!cancelled) {
          if (data.success) {
            setExamList(data.data || []);
          } else {
            setExamError(data.message || "Failed to load exams");
          }
        }
      } catch (e) {
        if (!cancelled) {
          setExamError(e.response?.data?.message || "Failed to load exams");
        }
      } finally {
        if (!cancelled) setExamLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [examCode]);

  useEffect(() => {
    let cancelled = false;

    if (!examCode) {
      setQuestions([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError("");
    setAnswers({});
    setCurrent(0);
    setSubmitSuccess(null);

    (async () => {
      try {
        const { data } = await questionApi.byExamCode(examCode);
        const list = data?.questions || data?.data || [];
        if (!cancelled) {
          setQuestions(list);
          if (!list.length) {
            setError("No questions found for this exam.");
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || "Could not load questions");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [examCode]);

  const visibleQuestions = useMemo(() => {
    if (!questions.length) return [];
    return questions.filter((question) => {
      if (question.type !== "branch_child") return true;
      const parentAns = answers[question.parentQuestion];
      if (!parentAns?.selectedAnswer) return false;
      return parentAns.selectedAnswer === question.branchKey;
    });
  }, [questions, answers]);

  useEffect(() => {
    if (!visibleQuestions.length) return;
    if (current >= visibleQuestions.length) {
      setCurrent(visibleQuestions.length - 1);
    }
  }, [visibleQuestions, current]);

  const q = visibleQuestions[current];
  const aid = answers[q?.questionNumber] || {};
  const branchMustSelect = q?.type === "branch_parent" && !aid?.selectedAnswer;
  const branchLocked = q?.type === "branch_parent" && !!aid?.selectedAnswer;

  const scoredQuestions = useMemo(
    () => visibleQuestions.filter((vq) => vq.type !== "branch_parent"),
    [visibleQuestions]
  );
  const displayIndexMap = useMemo(() => {
    const map = new Map();
    scoredQuestions.forEach((sq, idx) => {
      map.set(sq.questionNumber, idx + 1);
    });
    return map;
  }, [scoredQuestions]);
  const displayTotal = scoredQuestions.length;
  const displayIndex =
    q?.type === "branch_parent"
      ? null
      : displayIndexMap.get(q?.questionNumber);

  const attemptedCount = scoredQuestions.filter(
    (vq) => answers[vq.questionNumber]?.status === "attempted"
  ).length;
  const skippedCount = scoredQuestions.filter(
    (vq) => answers[vq.questionNumber]?.status === "skipped"
  ).length;
  const pendingCount = displayTotal - attemptedCount - skippedCount;

  const navItems = useMemo(
    () =>
      visibleQuestions.map((vq, i) => ({
        q: vq,
        visibleIdx: i,
        label: vq.type === "branch_parent" ? "X" : displayIndexMap.get(vq.questionNumber),
      })),
    [visibleQuestions, displayIndexMap]
  );

  const updateAnswer = (questionNumber, updater) => {
    setAnswers((prev) => {
      const prevAns = prev[questionNumber] || {};
      const next =
        typeof updater === "function" ? updater(prevAns) : { ...prevAns, ...updater };
      return { ...prev, [questionNumber]: next };
    });
  };

  const markSingleAttempted = (opt) => {
    if (!q) return;
    updateAnswer(q.questionNumber, (prevAns) => {
      if (q.type === "branch_parent" && prevAns.selectedAnswer) return prevAns;
      return {
        ...prevAns,
        status: "attempted",
        selectedAnswer: opt,
        selectedAnswers: [],
        confidence:
          q.type === "confidence"
            ? prevAns.confidence || "mid"
            : prevAns.confidence || null,
      };
    });
  };

  const toggleMultipleAttempt = (opt) => {
    if (!q) return;
    updateAnswer(q.questionNumber, (prevAns) => {
      const prevSelected = prevAns.selectedAnswers || [];
      const exists = prevSelected.includes(opt);
      const updated = exists
        ? prevSelected.filter((k) => k !== opt)
        : [...prevSelected, opt];
      return {
        ...prevAns,
        selectedAnswer: null,
        selectedAnswers: updated,
        status: updated.length ? "attempted" : "not_visited",
      };
    });
  };

  const markSkipped = () => {
    if (!q) return;
    updateAnswer(q.questionNumber, {
      status: "skipped",
      selectedAnswer: null,
      selectedAnswers: [],
      confidence: null,
    });
  };

  const handleConfidenceChange = (level) => {
    if (!q) return;
    updateAnswer(q.questionNumber, { confidence: level });
  };

  const handleSubmit = async () => {
    if (!examCode.trim()) {
      setError("Exam not selected. Please choose from dashboard.");
      return;
    }
    setError("");
    setSubmitLoading(true);
    try {
      const payload = questions.map((question) => {
        const a = answers[question.questionNumber] || {};
        let selectedAnswer = a.selectedAnswer || null;
        let selectedAnswers = a.selectedAnswers || [];

        const branchAllowed =
          question.type !== "branch_child" ||
          answers[question.parentQuestion]?.selectedAnswer === question.branchKey;

        if (!branchAllowed) {
          selectedAnswer = null;
          selectedAnswers = [];
        }

        const hasSelection =
          question.type === "multiple"
            ? selectedAnswers.length > 0
            : !!selectedAnswer;

        let status = a.status || "not_visited";
        if (status !== "skipped") {
          status = hasSelection ? "attempted" : "not_visited";
        }
        if (!branchAllowed) status = "not_visited";

        return {
          questionNumber: question.questionNumber,
          type: question.type,
          selectedAnswer,
          selectedAnswers,
          confidence:
            question.type === "confidence"
              ? a.confidence || "mid"
              : a.confidence || null,
          status,
        };
      });

      const submitBody = {
        examCode: examCode.trim(),
        attempts: payload,
      };
      if (studentId.trim()) {
        submitBody.studentId = studentId.trim();
      }

      const { data } = await examApi.submit(submitBody);

      if (data.success) {
        setSubmitSuccess({ attemptId: data.attemptId, result: data });
      } else {
        setError(data.message || "Submit failed");
      }
      } catch (e) {
        const serverMsg =
          e.response?.data?.error || e.response?.data?.message || "Submit failed";
        setError(serverMsg);
      } finally {
        setSubmitLoading(false);
      }
  };

  if (!examCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FFE6A3] rounded-full blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-[#FFEBD0] rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 min-h-screen">
          <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] rounded-xl flex items-center justify-center shadow">
                <span className="text-xs font-bold text-gray-900">TTT</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Choose Your Exam
              </h3>
              <p className="text-gray-600 text-sm">
                Pick an exam to start.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-left">
              {examLoading ? (
                <div className="text-xs text-gray-500 sm:col-span-2">
                  Loading exams...
                </div>
              ) : examError ? (
                <div className="text-xs text-red-600 sm:col-span-2">
                  {examError}
                </div>
              ) : examList.length > 0 ? (
                examList.map((exam) => (
                  <div
                    key={exam.examCode}
                    className="group relative overflow-hidden rounded-2xl border border-[#FFE1B5] bg-white/95 shadow-sm hover:shadow-md transition"
                  >
                    <div className="absolute inset-0 pointer-events-none opacity-40 bg-gradient-to-br from-[#FFF3C4]/60 via-transparent to-[#FFE0D9]/70" />
                    <div className="relative p-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-amber-700/80">
                            Exam Paper
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {exam.title || exam.examCode}
                          </p>
                          <p className="text-[11px] text-gray-600">
                            Exam Code: {exam.examCode} | Time:{" "}
                            {exam.totalTimeMinutes || 60} min
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] flex items-center justify-center text-[10px] font-bold text-gray-900 shadow">
                          TTT
                        </div>
                      </div>

                      <div className="text-[11px] text-gray-600">
                        Total Questions:{" "}
                        <span className="font-medium text-gray-900">
                          {exam.totalQuestions || 0}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          localStorage.setItem("examCode", exam.examCode);
                          setExamCode(exam.examCode);
                        }}
                        className="mt-1 text-[11px] px-3 py-2 rounded-full bg-[#FFCD2C] text-gray-900 font-semibold hover:bg-[#FFC107] transition"
                      >
                        Start Exam
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 sm:col-span-2">
                  No exams available yet.
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/student")}
                className="px-6 py-3 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FFE6A3] rounded-full blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-[#FFEBD0] rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/95 rounded-2xl shadow-xl border border-[#FFE6A3] p-8 max-w-md w-full text-center animate-fade-in-up backdrop-blur">
            <div className="w-12 h-12 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 text-lg font-bold">OK</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Exam submitted
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Your answers have been saved. Click below to view your result.
            </p>
            <div className="space-y-2">
              <button
                onClick={() =>
                  navigate(`/student/result/${submitSuccess.attemptId}`, {
                    state: submitSuccess.result,
                  })
                }
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                View Result
              </button>
              <button
                onClick={() => navigate("/student")}
                className="w-full py-3 bg-white/90 text-gray-800 font-semibold rounded-lg border border-[#FFE6A3] hover:bg-[#FFF3C4] transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FFE6A3] rounded-full blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-[#FFEBD0] rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#FFCD2C] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 animate-pulse">
              Preparing your exam...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No questions
  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FFE6A3] rounded-full blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-[#FFEBD0] rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/95 rounded-2xl shadow-xl border border-[#FFE6A3] p-8 text-center max-w-md animate-fade-in-up backdrop-blur">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-gray-500">?</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No Questions Found
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Exam Code: <span className="font-semibold">{examCode}</span>
            </p>
            <button
              onClick={() => {
                setError("");
                localStorage.removeItem("examCode");
                setExamCode("");
                navigate("/student");
              }}
              className="px-6 py-3 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 font-medium rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 mx-auto"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main exam UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FFE6A3] rounded-full blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-[#FFEBD0] rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 text-red-700 rounded-lg text-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Panel - Question & Options */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 rounded-xl shadow-lg border border-[#FFE6A3] overflow-hidden animate-fade-in-up backdrop-blur">
                <div className="h-1 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00]" />

                <div className="p-6">
                  {/* Question Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        {q?.type === "branch_parent"
                          ? "Branch Choice"
                          : `Question ${displayIndex}`}
                      </h2>
                      <p className="text-xs text-gray-600">
                        Type: {TYPE_LABELS[q?.type] || q?.type || "-"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Progress</div>
                      <div className="text-lg font-bold text-gray-900">
                        {displayIndex || 0}/{displayTotal}
                      </div>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-6 p-4 bg-[#FFF9E6] rounded-xl border border-[#FFE6A3]">
                    <p className="text-gray-900 font-medium leading-relaxed">
                      {q?.questionText}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-3 mb-6">
                    {(q?.type === "branch_parent"
                      ? (q?.options || []).filter(
                          (o) => o.key === "A" || o.key === "B"
                        )
                      : q?.options || []
                    ).map((o) => {
                      const isMultiple = q?.type === "multiple";
                      const isSelected = isMultiple
                        ? (aid?.selectedAnswers || []).includes(o.key)
                        : aid?.selectedAnswer === o.key;
                      const isDisabled = q?.type === "branch_parent" && branchLocked;

                      return (
                        <label
                          key={o.key}
                          onMouseEnter={() => setHoveredOption(o.key)}
                          onMouseLeave={() => setHoveredOption(null)}
                          className={`group flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "border-[#FFCD2C] bg-gradient-to-r from-[#FFF9E6] to-[#FFF3C4] shadow-sm"
                              : hoveredOption === o.key
                              ? "border-[#FFE1B5] bg-[#FFFDF5] shadow-sm"
                              : "border-[#FFE1B5] hover:border-[#FFCD2C]"
                          } ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          <div
                            className={`w-5 h-5 ${
                              isMultiple ? "rounded-md" : "rounded-full"
                            } border-2 flex items-center justify-center transition-all duration-200 ${
                              isSelected
                                ? "border-[#FFCD2C] bg-[#FFCD2C]"
                                : "border-[#FFE1B5] group-hover:border-[#FFCD2C]"
                            }`}
                          >
                            {isSelected && (
                              <div
                                className={`w-2 h-2 ${
                                  isMultiple ? "rounded-sm" : "rounded-full"
                                } bg-white`}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-semibold ${
                                  isSelected ? "text-amber-800" : "text-gray-700"
                                }`}
                              >
                                {o.key}.
                              </span>
                              <span className="text-gray-800">{o.text}</span>
                            </div>
                          </div>
                          <input
                            type={isMultiple ? "checkbox" : "radio"}
                            name={`opt-${q?.questionNumber || "q"}`}
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() =>
                              isMultiple
                                ? toggleMultipleAttempt(o.key)
                                : markSingleAttempted(o.key)
                            }
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>

                  {q?.type === "branch_parent" && !aid?.selectedAnswer && (
                    <div className="mb-4 text-xs text-amber-700">
                      Please choose A or B to continue. (Branch decision required)
                    </div>
                  )}
                  {q?.type === "branch_parent" && aid?.selectedAnswer && (
                    <div className="mb-4 text-xs text-emerald-700">
                      Branch locked: {aid.selectedAnswer}. You cannot change it.
                    </div>
                  )}

                  {/* Confidence Level */}
                  {q?.type === "confidence" && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Confidence Level
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {CONFIDENCE_OPTS.map((c) => (
                          <button
                            key={c.value}
                            onClick={() => handleConfidenceChange(c.value)}
                            className={`group px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                              aid?.confidence === c.value
                                ? `bg-gradient-to-br ${c.color} text-white shadow-md`
                                : "bg-[#FFF9E6] text-gray-700 hover:bg-[#FFF3C4] hover:shadow-sm"
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={markSkipped}
                      disabled={q?.type === "branch_parent"}
                      className={`px-4 py-2.5 bg-gradient-to-br from-amber-100 to-orange-100 text-amber-800 font-medium rounded-lg hover:shadow transition-all duration-200 hover:-translate-y-0.5 ${
                        q?.type === "branch_parent"
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      Skip Question
                    </button>
                    <div className="flex-1 flex justify-end gap-2">
                      {current > 0 && (
                        <button
                          onClick={() => setCurrent((c) => c - 1)}
                          className="px-4 py-2.5 bg-white border border-[#FFE1B5] text-gray-800 font-medium rounded-lg hover:shadow transition-all duration-200 hover:-translate-y-0.5"
                        >
                          Previous
                        </button>
                      )}
                      {current < visibleQuestions.length - 1 && (
                        <button
                          onClick={() => !branchMustSelect && setCurrent((c) => c + 1)}
                          disabled={branchMustSelect}
                          className={`px-4 py-2.5 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 font-medium rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${
                            branchMustSelect ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={submitLoading}
                    className="mt-4 w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitLoading ? "Submitting..." : "Submit Exam"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Progress */}
            <div className="space-y-6">
              {/* Question Navigator */}
              <div className="bg-white/95 rounded-xl shadow-lg border border-[#FFE6A3] overflow-hidden backdrop-blur">
                <div className="h-1 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00]" />
                <div className="p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">
                    Question Navigator
                  </h3>
                  <div className="grid grid-cols-10 gap-1">
                    {navItems.map(({ q: navQ, visibleIdx, label }) => {
                      const answer = answers[navQ.questionNumber];
                      const isCurrent = current === visibleIdx;
                      const disableNav = branchMustSelect && visibleIdx !== current;

                      let bgClass = "bg-gray-200 text-gray-700";
                      if (isCurrent)
                        bgClass =
                          "bg-[#111827] text-white shadow-md";
                      else if (answer?.status === "attempted")
                        bgClass =
                          "bg-emerald-600 text-white";
                      else if (answer?.status === "skipped")
                        bgClass =
                          "bg-amber-500 text-white";

                      return (
                        <button
                          key={`${navQ.questionNumber}-${visibleIdx}`}
                          onClick={() => !disableNav && setCurrent(visibleIdx)}
                          disabled={disableNav}
                          className={`w-full h-6 rounded-md text-[9px] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${bgClass} ${
                            disableNav ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {label || "-"}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 pt-4 border-t border-[#FFE6A3]">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-emerald-600" />
                        <span className="text-gray-600">Attempted</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-amber-500" />
                        <span className="text-gray-600">Skipped</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-[#111827]" />
                        <span className="text-gray-600">Current</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-gray-200" />
                        <span className="text-gray-600">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white/95 rounded-xl shadow-lg border border-[#FFE6A3] overflow-hidden backdrop-blur">
                <div className="h-1 bg-gradient-to-r from-gray-800 to-gray-900" />
                <div className="p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">
                    Progress Stats
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <div className="text-lg font-bold text-emerald-600">
                        {attemptedCount}
                      </div>
                      <div className="text-xs text-emerald-700">
                        Attempted
                      </div>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <div className="text-lg font-bold text-amber-600">
                        {skippedCount}
                      </div>
                      <div className="text-xs text-amber-700">Skipped</div>
                    </div>
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <div className="text-lg font-bold text-gray-700">
                        {pendingCount}
                      </div>
                      <div className="text-xs text-gray-700">Pending</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#FFE6A3] bg-white/90 py-4 mt-6 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] flex items-center justify-center">
                    <span className="text-gray-900 font-bold text-xs">E</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Online Exam
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-1 text-xs text-gray-500">
                  <div className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                  <span>
                    Time:{" "}
                    {time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>Questions: {displayTotal}</span>
                <span>|</span>
                <span>Answered: {attemptedCount}</span>
                <span>|</span>
                <span>Remaining: {pendingCount}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}








