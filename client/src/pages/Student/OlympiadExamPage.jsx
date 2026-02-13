// src/pages/Student/OlympiadExamPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { questionApi, olympiadExamApi } from "../../api";

const TIMER_DEFAULT_MINUTES = 60; // agar examConfig se time na mile

export default function OlympiadExamPage() {
  const { examCode } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]); // mixed: simple/multiple/confidence/branch_parent/branch_child
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // key: questionNumber
  const [timeLeft, setTimeLeft] = useState(null); // seconds
  const [submitting, setSubmitting] = useState(false);
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    const savedId =
      localStorage.getItem("examStudentId") ||
      localStorage.getItem("studentId");
    if (savedId) setStudentId(savedId);
  }, []);

  // 1) Questions fetch
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        setError("");
        const res = await questionApi.byExamCode(examCode);
        const data = res.data || res; // depending on backend shape

        const list = data.questions || data.data || [];
        if (!list.length) {
          setError("No questions found for this exam.");
          setLoading(false);
          return;
        }

        // Optional: sort by questionNumber
        list.sort((a, b) => a.questionNumber - b.questionNumber);

        setQuestions(list);

        // Timer: try to read from exam config if provided (data.exam?.durationMinutes)
        const durationMinutes = data.exam?.durationMinutes || TIMER_DEFAULT_MINUTES;
        setTimeLeft(durationMinutes * 60);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load exam questions.");
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [examCode]);

  // 2) Timer
  useEffect(() => {
    if (!timeLeft && timeLeft !== 0) return;
    if (timeLeft <= 0) {
      handleSubmitAuto();
      return;
    }
    const id = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 3) Branching logic: filter visible questions according to branch choice
  const visibleQuestions = useMemo(() => {
    if (!questions.length) return [];

    // branch_parent / branch_child ke liye:
    // 1) parent questions always visible
    // 2) branch_child only visible if parent ke answer me uska branchKey choose hua hai
    const parentAnswers = answers;

    return questions.filter((q) => {
      if (q.type !== "branch_child") return true;
      const parentQNum = q.parentQuestion;
      const parentAns = parentAnswers[parentQNum];
      if (!parentAns) return false;
      // parentAns.selectedAnswer = "A" / "B"
      return parentAns.selectedAnswer === q.branchKey;
    });
  }, [questions, answers]);

  // Jab visibleQuestions update ho, currentIndex adjust karo
  useEffect(() => {
    if (!visibleQuestions.length) return;
    if (currentIndex >= visibleQuestions.length) {
      setCurrentIndex(visibleQuestions.length - 1);
    }
  }, [visibleQuestions, currentIndex]);

  const handleOptionClick = (q, optKey) => {
    setAnswers((prev) => {
      const prevAns = prev[q.questionNumber] || {};
      if (q.type === "branch_parent" && prevAns.selectedAnswer) {
        return prev; // branch choice ek hi baar
      }
      if (q.type === "simple" || q.type === "confidence" || q.type === "branch_child" || q.type === "branch_parent") {
        return {
          ...prev,
          [q.questionNumber]: {
            ...prevAns,
            selectedAnswer: optKey,
          },
        };
      }
      if (q.type === "multiple") {
        const prevSelected = prevAns.selectedAnswers || [];
        const exists = prevSelected.includes(optKey);
        let updated;
        if (exists) {
          updated = prevSelected.filter((k) => k !== optKey);
        } else {
          updated = [...prevSelected, optKey];
        }
        return {
          ...prev,
          [q.questionNumber]: {
            ...prevAns,
            selectedAnswers: updated,
          },
        };
      }
      return prev;
    });
  };

  const handleConfidenceChange = (q, level) => {
    setAnswers((prev) => {
      const prevAns = prev[q.questionNumber] || {};
      return {
        ...prev,
        [q.questionNumber]: {
          ...prevAns,
          confidence: level, // "low" | "mid" | "high"
        },
      };
    });
  };

  const goNext = () => {
    const currentQ = visibleQuestions[currentIndex];
    const currentAns = currentQ ? answers[currentQ.questionNumber] || {} : {};
    if (currentQ?.type === "branch_parent" && !currentAns.selectedAnswer) {
      return;
    }
    if (currentIndex < visibleQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmitAuto = useCallback(() => {
    if (submitting) return;
    submitExam(true);
  }, [submitting]);

  const handleSubmitClick = () => {
    if (window.confirm("Are you sure you want to submit the exam?")) {
      submitExam(false);
    }
  };

  // 4) Submit exam  send to backend for scoring
  const submitExam = async (auto) => {
    try {
      setSubmitting(true);

      // Prepare payload: examCode + per-question data
      const payloadAttempts = questions.map((q) => {
        const ans = answers[q.questionNumber] || {};
        let status = "not_visited";
        const hasSelection =
          q.type === "multiple"
            ? (ans.selectedAnswers || []).length > 0
            : !!ans.selectedAnswer;

        if (hasSelection) status = "attempted";
        // skip detection tum UI ke hisaab se alag bhi kar sakte ho, abhi simple rakha
        return {
          examCode,
          questionNumber: q.questionNumber,
          type: q.type,
          selectedAnswer: ans.selectedAnswer || null, // simple/confidence/branch
          selectedAnswers: ans.selectedAnswers || [],
          confidence: ans.confidence || null,
          status,
        };
      });

      const body = {
        examCode,
        attempts: payloadAttempts,
        autoSubmitted: !!auto,
      };
      const sid = (studentId || "").trim();
      if (sid) body.studentId = sid;

      const res = await olympiadExamApi.submit(body);
      const result = res.data || res;

      // Expect: result = { totalMarks, detailedAttempts: [...] }
      if (result?.attemptId) {
        navigate(`/student/result/${result.attemptId}`, { state: result });
      } else {
        navigate(`/student/result`, { state: result });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit exam. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-slate-900 rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-700">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error || !visibleQuestions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border rounded-2xl px-6 py-5 shadow-sm max-w-md w-full text-center">
          <h1 className="text-base font-semibold text-slate-800 mb-1">
            {error || "No questions to show"}
          </h1>
          <p className="text-sm text-slate-500">
            Please contact admin or try a different exam.
          </p>
          <button
            onClick={() => navigate("/student")}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-medium hover:bg-black"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  const q = visibleQuestions[currentIndex];
  const ans = q ? answers[q.questionNumber] || {} : {};
  const qType = q?.type;
  const branchMustSelect = qType === "branch_parent" && !ans.selectedAnswer;
  const branchLocked = qType === "branch_parent" && !!ans.selectedAnswer;

  const scoredQuestions = useMemo(
    () => visibleQuestions.filter((vq) => vq.type !== "branch_parent"),
    [visibleQuestions]
  );
  const displayTotal = scoredQuestions.length;
  const displayIndex =
    qType === "branch_parent"
      ? null
      : scoredQuestions.findIndex((x) => x.questionNumber === q?.questionNumber) +
        1;

  const userSelected =
    qType === "multiple" ? ans.selectedAnswers || [] : ans.selectedAnswer ? [ans.selectedAnswer] : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto py-4 px-3 md:px-6 space-y-4">
        {/* Top bar: exam + timer */}
        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Olympiad Exam - {examCode}
            </h1>
            <p className="text-xs text-slate-500">
              Answer all questions. Timer runs continuously, auto-submit on time up.
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-mono">
              Time left: {formatTime(timeLeft ?? 0)}
            </div>
            <button
              onClick={handleSubmitClick}
              disabled={submitting}
              className="px-4 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex gap-2 items-start">
              <div className="text-xs font-semibold text-slate-700">
                {qType === "branch_parent"
                  ? "Branch Choice"
                  : `Q${displayIndex}.`}
              </div>
              <div>
                <p className="text-sm text-slate-900">{q.questionText}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Type: {qType}
                  {qType === "confidence" && "  You must choose confidence level with your answer."}
                  {qType === "branch_parent" && "  This question decides your path (A or B). No marks."}
                </p>
              </div>
            </div>
            <div className="text-[11px] text-slate-500">
              {qType === "branch_parent"
                ? `Branch Choice  ${displayTotal} Questions`
                : `Question ${displayIndex} of ${displayTotal}`}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {(qType === "branch_parent"
              ? (q.options || []).filter((o) => o.key === "A" || o.key === "B")
              : q.options || []
            ).map((opt) => {
              const isSelected =
                qType === "multiple"
                  ? userSelected.includes(opt.key)
                  : ans.selectedAnswer === opt.key;
              const isDisabled = qType === "branch_parent" && branchLocked;

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleOptionClick(q, opt.key)}
                  disabled={isDisabled}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-xs md:text-sm flex gap-2 items-start transition ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                  } ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <span className="font-semibold min-w-[18px]">{opt.key}.</span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>

          {qType === "branch_parent" && !ans.selectedAnswer && (
            <p className="mt-2 text-[11px] text-amber-700">
              Please choose A or B to continue. (Branch decision required)
            </p>
          )}
          {qType === "branch_parent" && ans.selectedAnswer && (
            <p className="mt-2 text-[11px] text-emerald-700">
              Branch locked: {ans.selectedAnswer}. You cannot change it.
            </p>
          )}

          {/* Confidence selector */}
          {qType === "confidence" && (
            <div className="mt-3">
              <p className="text-[11px] text-slate-600 mb-1">
                Select your confidence level (required for marks):
              </p>
              <div className="flex gap-2 text-[11px]">
                {["low", "mid", "high"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleConfidenceChange(q, level)}
                    className={`px-3 py-1 rounded-full border transition ${
                      ans.confidence === level
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {level === "low" && "Low"}
                    {level === "mid" && "Medium"}
                    {level === "high" && "High"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-4 flex justify-between">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={currentIndex === visibleQuestions.length - 1 || branchMustSelect}
              className="px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

