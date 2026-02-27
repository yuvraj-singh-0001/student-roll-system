import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { olympiadExamApi } from "../../api";

const RESULT_CACHE_PREFIX = "examResultCacheV1:";

const readResultCache = (id) => {
  if (typeof window === "undefined" || !id) return null;
  try {
    const raw = localStorage.getItem(`${RESULT_CACHE_PREFIX}${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeResultCache = (id, data) => {
  if (typeof window === "undefined" || !id) return;
  try {
    localStorage.setItem(
      `${RESULT_CACHE_PREFIX}${id}`,
      JSON.stringify({ data, ts: Date.now() }),
    );
  } catch {
    // ignore cache write errors
  }
};

const SECTION_GROUPS = [
  {
    id: "simple",
    title: "Section 1 (Conventional MCQs)",
    types: ["simple"],
  },
  {
    id: "multiple",
    title: "Section 2 (Multiple Correct Answers MCQs)",
    types: ["multiple"],
  },
  {
    id: "confidence",
    title: "Section 3 (Confidence-Weighted MCQs)",
    types: ["confidence"],
  },
  {
    id: "branch",
    title: "Section 4 (Decision Tree MCQs)",
    types: ["branch_child"],
  },
];

const ArrowIcon = ({ direction = "down", className = "" }) => {
  const rotateClass =
    direction === "up"
      ? "rotate-180"
      : direction === "left"
        ? "-rotate-90"
        : direction === "right"
          ? "rotate-90"
          : "";

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-3 h-3 ${rotateClass} ${className}`}
      aria-hidden="true"
    >
      <path d="M12 4v12m0 0l-5-5m5 5l5-5" />
    </svg>
  );
};

export default function ExamResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const [result, setResult] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state && !!attemptId);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (location.state) {
      const normalized = {
        ...location.state,
        detailedAttempts:
          location.state?.detailedAttempts || location.state?.answers || [],
      };
      setResult(normalized);
      const cacheId = normalized.attemptId || attemptId;
      if (cacheId) writeResultCache(cacheId, normalized);
      setLoading(false);
      return;
    }
    if (!attemptId) return;

    const cached = readResultCache(attemptId);
    if (cached) {
      setResult(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const { data } = await olympiadExamApi.attemptDetails(attemptId);
        if (!cancelled) {
          if (data.success) {
            const normalized = {
              ...data.data,
              detailedAttempts: data.data?.answers || [],
            };
            setResult(normalized);
            writeResultCache(attemptId, normalized);
          } else {
            setError(data.message || "Failed to load result");
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || "Failed to load result");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attemptId, location.state]);

  const detailedAttempts = result?.detailedAttempts || [];

  const visibleAttempts = useMemo(() => {
    const branchChoices = {};
    detailedAttempts.forEach((a) => {
      if (a.type !== "branch_parent") return;
      if (a.selectedAnswer !== "A" && a.selectedAnswer !== "B") return;
      branchChoices[String(a.questionNumber)] = a.selectedAnswer;
    });
    return detailedAttempts.filter((a) => {
      if (a.type !== "branch_child") return true;
      if (!a.parentQuestion || !a.branchKey) return true;
      const choice = branchChoices[String(a.parentQuestion)];
      if (!choice) return false;
      return choice === a.branchKey;
    });
  }, [detailedAttempts]);

  const sortedVisibleAttempts = useMemo(() => {
    return [...visibleAttempts].sort(
      (a, b) => (a.questionNumber || 0) - (b.questionNumber || 0),
    );
  }, [visibleAttempts]);

  const scoredAttempts = useMemo(
    () => visibleAttempts.filter((a) => a.type !== "branch_parent"),
    [visibleAttempts],
  );

  const total = result?.totalMarks ?? 0;
  const attempted =
    result?.attemptedCount ??
    scoredAttempts.filter((a) => a.status === "attempted").length;
  const skipped =
    result?.skippedCount ??
    scoredAttempts.filter((a) => a.status === "skipped").length;
  const correct =
    result?.correctCount ??
    scoredAttempts.filter((a) => a.isCorrect === true).length;
  const wrong =
    result?.wrongCount ??
    scoredAttempts.filter(
      (a) => a.isCorrect === false && a.status === "attempted",
    ).length;
  const examCode = result?.examCode || "";
  const totalQuestions = scoredAttempts.length;

  const formatMarks = (value) => {
    const num = Number.isFinite(Number(value)) ? Number(value) : 0;
    const fixed = num.toFixed(2);
    return fixed.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
  };

  const formatDurationMs = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) return "-";
    const totalSeconds = Math.round(num / 100) / 10;
    if (totalSeconds < 60) {
      const text = totalSeconds.toFixed(1);
      return `${text.replace(/\.0$/, "")}s`;
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  };

  const formatDurationList = (list) => {
    if (!Array.isArray(list) || list.length === 0) return "-";
    return list.map(formatDurationMs).join(", ");
  };

  const formatHistory = (history) => {
    if (!Array.isArray(history) || history.length === 0) return "-";
    const cleaned = history
      .map((v) => (typeof v === "string" && v.trim() ? v.trim() : "-"))
      .filter((v) => v !== "-");
    if (!cleaned.length) return "-";
    return cleaned.join(" -> ");
  };

  const getAnswerChangeCount = (attempt) => {
    let baseCount = null;
    if (Number.isFinite(Number(attempt.answerChangeCount))) {
      baseCount = Math.max(0, Math.floor(Number(attempt.answerChangeCount)));
    } else if (Array.isArray(attempt.answerHistory)) {
      baseCount = attempt.answerHistory.length;
    }
    if (baseCount === null) return 0;
    return Math.max(baseCount - 1, 0);
  };

  const getVisitParts = (attempt) => {
    const list = Array.isArray(attempt.visitDurationsMs)
      ? attempt.visitDurationsMs.filter(
          (v) => Number.isFinite(Number(v)) && Number(v) >= 0,
        )
      : [];
    const first = list.length ? list[0] : null;
    const revisits = list.length > 1 ? list.slice(1) : [];
    const total =
      Number.isFinite(Number(attempt.totalTimeMs)) &&
      Number(attempt.totalTimeMs) >= 0
        ? Number(attempt.totalTimeMs)
        : list.length
          ? list.reduce((sum, v) => sum + Number(v), 0)
          : null;
    return { first, revisits, revisitCount: revisits.length, total };
  };

  const formatRevisitTimes = (revisits) => {
    if (!Array.isArray(revisits) || revisits.length === 0) return "-";
    return revisits.map((v) => `+${formatDurationMs(v)}`).join(", ");
  };

  const getMaxMarksForAttempt = (attempt) => {
    const type = attempt?.type;
    if (type === "multiple") return 2;
    if (type === "confidence") return 2;
    if (type === "simple" || type === "branch_child") return 1;
    return 0;
  };

  const maxMarks = useMemo(
    () => scoredAttempts.reduce((sum, a) => sum + getMaxMarksForAttempt(a), 0),
    [scoredAttempts],
  );

  const positiveMarks = useMemo(
    () =>
      scoredAttempts.reduce((sum, a) => {
        const marks = Number.isFinite(Number(a.marks)) ? Number(a.marks) : 0;
        return sum + (marks > 0 ? marks : 0);
      }, 0),
    [scoredAttempts],
  );

  const negativeMarks = useMemo(
    () =>
      scoredAttempts.reduce((sum, a) => {
        const marks = Number.isFinite(Number(a.marks)) ? Number(a.marks) : 0;
        return sum + (marks < 0 ? marks : 0);
      }, 0),
    [scoredAttempts],
  );

  const animationKey = `${result?.attemptId || "local"}-${totalQuestions}-${attempted}-${skipped}-${correct}-${wrong}-${total}-${positiveMarks}-${negativeMarks}-${maxMarks}`;
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setAnimProgress(1);
      return;
    }

    let rafId = null;
    const duration = 900;
    const start = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const raw = Math.min((now - start) / duration, 1);
      setAnimProgress(easeOutCubic(raw));
      if (raw < 1) rafId = requestAnimationFrame(tick);
    };

    setAnimProgress(0);
    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [animationKey]);

  const animateCount = (value) => Math.round(value * animProgress);
  const animateMarks = (value) => value * animProgress;

  const sectionedAttempts = useMemo(() => {
    return SECTION_GROUPS.map((section) => ({
      ...section,
      attempts: sortedVisibleAttempts.filter((a) =>
        section.types.includes(a.type),
      ),
    }));
  }, [sortedVisibleAttempts]);

  const branchParents = useMemo(
    () => sortedVisibleAttempts.filter((a) => a.type === "branch_parent"),
    [sortedVisibleAttempts],
  );

  const displayNumberMap = useMemo(() => {
    const map = new Map();
    let index = 1;
    sortedVisibleAttempts.forEach((a) => {
      if (a.type === "branch_parent") return;
      map.set(a.questionNumber, index);
      index += 1;
    });
    return map;
  }, [sortedVisibleAttempts]);

  const getDisplayNumber = (attempt) =>
    displayNumberMap.get(attempt.questionNumber) ?? attempt.questionNumber;

  const detailBlocks = useMemo(() => {
    const blocks = [];
    sectionedAttempts.forEach((section, idx) => {
      blocks.push({ type: "section", section });
      if (section.id === "confidence" && branchParents.length > 0) {
        blocks.push({ type: "branch" });
      }
    });
    return blocks;
  }, [sectionedAttempts, branchParents.length]);

  const getResultLabel = (attempt) => {
    const isSkipped =
      attempt.status === "skipped" || attempt.status === "not_visited";
    if (isSkipped) return "Skipped";
    if (attempt.type === "branch_parent") return "No Marks";
    if (attempt.isCorrect === true) return "Correct";
    if (attempt.isCorrect === false) {
      if (attempt.marks > 0) return "Partial";
      return "Wrong";
    }
    return "Attempted";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] overflow-hidden relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-24 w-72 h-72 bg-[#FFE6A3] rounded-full blur-3xl animate-blob" />
          <div className="absolute top-32 -left-24 w-72 h-72 bg-[#FFEBD0] rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 border-4 border-[#FFCD2C] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 animate-pulse">Loading result...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] overflow-hidden relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-24 w-72 h-72 bg-[#FFE6A3] rounded-full blur-3xl animate-blob" />
          <div className="absolute top-32 -left-24 w-72 h-72 bg-[#FFEBD0] rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/95 rounded-2xl shadow-xl border border-[#FFE6A3] p-8 text-center max-w-md animate-fade-in-up backdrop-blur">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
              <span className="text-sm font-bold text-red-600">ERR</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Unable to Load Result
            </h3>
            <p className="text-red-600 mb-6 text-sm">{error}</p>
            <button
              onClick={() => navigate("/student")}
              className="px-6 py-3 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 font-medium rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 mx-auto"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] overflow-hidden relative">
      {/* background blobs (same family) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-24 w-72 h-72 bg-[#FFE6A3] rounded-full blur-3xl animate-blob" />
        <div className="absolute top-32 -left-24 w-72 h-72 bg-[#FFEBD0] rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* main card */}
      <main className="relative z-10 max-w-none mx-auto px-4 py-4">
        <div className="bg-white/95 rounded-2xl shadow-xl border border-[#FFE6A3] overflow-hidden animate-scale-in backdrop-blur">
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-[#FFCD2C] to-emerald-400" />
          <div className="p-4 sm:p-5">
            {/* message */}
            <div className="text-center animate-fade-in-up delay-1">
              <h2 className="text-xl font-bold text-gray-900">
                Result Overview
              </h2>
            </div>

            {/* result overview */}
            <div className="mt-3 animate-fade-in-up delay-2">
              {examCode && (
                <div className="text-[11px] text-center text-gray-600 mb-2">
                  Exam Code:{" "}
                  <span className="font-semibold text-gray-900">
                    {examCode}
                  </span>
                  {result?.mockTestCode && (
                    <>
                      {" | "}
                      Mock Test:{" "}
                      <span className="font-semibold text-emerald-700">
                        {result.mockTestCode}
                      </span>
                    </>
                  )}
                </div>
              )}

              <div className="mt-3 grid lg:grid-cols-2 gap-3">
                <div className="p-3 bg-[#FFF9E6] rounded-xl border border-[#FFE6A3] animate-fade-in-up">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                    In terms of questions
                  </h4>

                  <div className="sm:hidden grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-3 py-2 text-center">
                      <div className="text-[11px] text-amber-700">
                        Total Questions
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {animateCount(totalQuestions)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-3 py-2 text-center">
                      <div className="text-[11px] text-gray-600">Attempted</div>
                      <div className="text-lg font-bold text-gray-900">
                        {animateCount(attempted)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-3 py-2 text-center">
                      <div className="text-[11px] text-gray-600">Skipped</div>
                      <div className="text-lg font-bold text-gray-900">
                        {animateCount(skipped)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-3 py-2 text-center">
                      <div className="text-[11px] text-gray-600">Correct</div>
                      <div className="text-lg font-bold text-emerald-700">
                        {animateCount(correct)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-3 py-2 text-center">
                      <div className="text-[11px] text-gray-600">Wrong</div>
                      <div className="text-lg font-bold text-red-700">
                        {animateCount(wrong)}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <div className="flex justify-center">
                      <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-4 py-2 text-center shadow-sm">
                        <div className="text-[11px] text-amber-700">
                          Total Questions
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {animateCount(totalQuestions)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="w-px h-4 diagram-line-v" />
                      <ArrowIcon className="text-[#FFD977]" />
                    </div>
                    <div className="flex items-center justify-center">
                      <ArrowIcon direction="left" className="text-[#FFD977]" />
                      <div className="w-44 h-px diagram-line-h" />
                      <ArrowIcon direction="right" className="text-[#FFD977]" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="flex flex-col items-center">
                        <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-4 py-2 text-center shadow-sm">
                          <div className="text-[11px] text-gray-600">
                            Attempted
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {animateCount(attempted)}
                          </div>
                        </div>

                        <div className="flex flex-col items-center mt-2">
                          <div className="w-px h-3 diagram-line-v" />
                          <ArrowIcon className="text-[#FFD977]" />
                        </div>
                        <div className="flex items-center justify-center">
                          <ArrowIcon
                            direction="left"
                            className="text-[#FFD977]"
                          />
                          <div className="w-28 h-px diagram-line-h" />
                          <ArrowIcon
                            direction="right"
                            className="text-[#FFD977]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                          <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-3 py-2 text-center">
                            <div className="text-[11px] text-emerald-700">
                              Correct
                            </div>
                            <div className="text-lg font-bold text-emerald-700">
                              {animateCount(correct)}
                            </div>
                          </div>
                          <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-3 py-2 text-center">
                            <div className="text-[11px] text-rose-700">
                              Wrong
                            </div>
                            <div className="text-lg font-bold text-rose-700">
                              {animateCount(wrong)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start justify-center">
                        <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-4 py-2 text-center shadow-sm">
                          <div className="text-[11px] text-gray-600">
                            Skipped
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {animateCount(skipped)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#FFF9E6] rounded-xl border border-[#FFE6A3] animate-fade-in-up delay-1">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                    In terms of marks
                  </h4>

                  <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-3 py-2 text-center mb-3 shadow-sm">
                    <div className="text-[11px] text-amber-700">
                      Maximum marks (if all correct)
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatMarks(animateMarks(maxMarks))}
                    </div>
                  </div>

                  <div className="sm:hidden grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-3 py-2 text-center">
                      <div className="text-[11px] text-emerald-700">
                        Marks gained
                      </div>
                      <div className="text-lg font-bold text-emerald-700">
                        +{formatMarks(animateMarks(positiveMarks))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-3 py-2 text-center">
                      <div className="text-[11px] text-rose-700">
                        Marks deducted
                      </div>
                      <div className="text-lg font-bold text-rose-700">
                        {formatMarks(animateMarks(negativeMarks))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-3 py-2 text-center col-span-2">
                      <div className="text-[11px] text-gray-600">
                        Marks obtained
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {total > 0
                          ? `+${formatMarks(animateMarks(total))}`
                          : formatMarks(animateMarks(total))}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-4 py-2 text-center">
                        <div className="text-[11px] text-emerald-700">
                          Marks gained (correct/partial)
                        </div>
                        <div className="text-lg font-bold text-emerald-700">
                          +{formatMarks(animateMarks(positiveMarks))}
                        </div>
                      </div>
                      <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-4 py-2 text-center">
                        <div className="text-[11px] text-rose-700">
                          Marks deducted (wrong)
                        </div>
                        <div className="text-lg font-bold text-rose-700">
                          {formatMarks(animateMarks(negativeMarks))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <ArrowIcon direction="left" className="text-[#FFD977]" />
                      <div className="w-44 h-px diagram-line-h my-2" />
                      <ArrowIcon direction="right" className="text-[#FFD977]" />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-px h-4 diagram-line-v" />
                      <ArrowIcon className="text-[#FFD977]" />
                    </div>

                    <div className="flex justify-center">
                      <div className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-5 py-2 text-center shadow-sm">
                        <div className="text-[11px] text-gray-600">
                          Total marks
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {total > 0
                            ? `+${formatMarks(animateMarks(total))}`
                            : formatMarks(animateMarks(total))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {visibleAttempts.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowDetails((prev) => !prev)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 font-semibold shadow hover:shadow-lg transition-all"
                  >
                    {showDetails
                      ? "Hide Detailed Result"
                      : "Show Detailed Result"}
                  </button>
                </div>
              )}
            </div>

            {/* detailed result */}
            {showDetails && (
              <div className="mt-5 space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Detailed Result
                  </h3>
                  <span className="text-[11px] text-gray-600">
                    Question-wise breakdown
                  </span>
                </div>

                {detailBlocks.map((block, index) => {
                  if (block.type === "branch") {
                    return (
                      <div
                        key={`branch-parent-${index}`}
                        className="rounded-xl border border-[#FFE6A3] bg-white/95 p-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">
                            Branch Decision (Question X)
                          </h4>
                          <span className="text-[11px] text-gray-600">
                            {branchParents.length} Question
                            {branchParents.length > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="space-y-2 text-xs text-gray-700">
                          {branchParents.map((bp, idx) => (
                            <div
                              key={`branch-parent-${bp.questionNumber}-${idx}`}
                              className="rounded-lg border border-[#FFE1B5] bg-[#FFFDF5] px-3 py-2"
                            >
                              <div className="font-semibold text-gray-900">
                                Question X
                              </div>
                              <div className="text-gray-700 mt-0.5">
                                {bp.questionText || "-"}
                              </div>
                              <div className="text-[11px] text-gray-600 mt-1">
                                Selected:{" "}
                                <span className="font-semibold text-gray-900">
                                  {bp.selectedAnswer || "-"}
                                </span>
                              </div>
                              {(() => {
                                const visit = getVisitParts(bp);
                                return (
                                  <div className="mt-1 space-y-0.5 text-[10px] text-gray-600">
                                    <div>
                                      First visit:{" "}
                                      {formatDurationMs(visit.first)}
                                    </div>
                                    <div>
                                      Revisits ({visit.revisitCount}):{" "}
                                      {formatRevisitTimes(visit.revisits)}
                                    </div>
                                    <div>
                                      Total visit time:{" "}
                                      {formatDurationMs(visit.total)}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  const section = block.section;

                  return (
                    <div
                      key={section.id}
                      className="rounded-xl border border-[#FFE6A3] bg-white/95 p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {section.title}
                        </h4>
                        <span className="text-[11px] text-gray-600">
                          {section.attempts.length} Questions
                        </span>
                      </div>

                      {section.attempts.length === 0 ? (
                        <p className="text-xs text-gray-500">
                          No questions found in this section.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-[1200px] w-full text-[11px] text-gray-700">
                            <thead>
                              <tr className="text-left text-[11px] text-gray-500 border-b border-[#FFE6A3]">
                                <th className="py-2 pr-3 font-medium">Q.No</th>
                                <th className="py-2 pr-3 font-medium">
                                  Question
                                </th>
                                <th className="py-2 pr-3 font-medium">
                                  Correct Answer
                                </th>
                                <th className="py-2 pr-3 font-medium">
                                  Your Answer
                                </th>
                                {section.id === "confidence" && (
                                  <th className="py-2 pr-3 font-medium">
                                    Confidence
                                  </th>
                                )}
                                <th className="py-2 pr-3 font-medium">
                                  Visit Time
                                </th>
                                <th className="py-2 pr-3 font-medium">
                                  Answer Changes
                                </th>
                                <th className="py-2 pr-3 font-medium">
                                  Result
                                </th>
                                <th className="py-2 font-medium">Marks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.attempts.map((d, idx) => {
                                const selectedText =
                                  d.type === "multiple"
                                    ? (d.selectedAnswers || []).join(", ") ||
                                      "-"
                                    : d.selectedAnswer || "-";
                                const correctText =
                                  d.type === "multiple"
                                    ? (d.correctAnswers || []).join(", ") || "-"
                                    : d.correctAnswer || "-";
                                const label = getResultLabel(d);
                                const labelClass =
                                  label === "Correct"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : label === "Wrong"
                                      ? "bg-rose-100 text-rose-800"
                                      : label === "Skipped"
                                        ? "bg-amber-100 text-amber-800"
                                        : label === "Partial"
                                          ? "bg-sky-100 text-sky-800"
                                          : "bg-slate-100 text-slate-700";
                                const rowClass =
                                  label === "Correct"
                                    ? "bg-emerald-50/70"
                                    : label === "Wrong"
                                      ? "bg-rose-50/70"
                                      : label === "Skipped"
                                        ? "bg-amber-50/70"
                                        : label === "Partial"
                                          ? "bg-sky-50/70"
                                          : "bg-slate-50/60";
                                const confidenceText = d.confidence
                                  ? String(d.confidence).toUpperCase()
                                  : "-";
                                const confidenceClass =
                                  confidenceText === "HIGH"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : confidenceText === "MID" ||
                                        confidenceText === "MEDIUM"
                                      ? "bg-amber-100 text-amber-800"
                                      : confidenceText === "LOW"
                                        ? "bg-rose-100 text-rose-800"
                                        : "bg-slate-100 text-slate-700";

                                return (
                                  <tr
                                    key={`${section.id}-${d.questionNumber}-${idx}`}
                                    className={`border-b border-[#FFF1CC] last:border-b-0 ${rowClass}`}
                                  >
                                    <td className="py-2 pr-3 align-top font-semibold text-gray-900">
                                      Q{getDisplayNumber(d)}
                                    </td>
                                    <td className="py-2 pr-3 align-top">
                                      <div className="text-gray-800">
                                        {d.questionText || "-"}
                                      </div>
                                      {d.marksReason && (
                                        <div className="text-[10px] text-gray-500 mt-1">
                                          {d.marksReason}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-2 pr-3 align-top">
                                      {correctText}
                                    </td>
                                    <td className="py-2 pr-3 align-top">
                                      {selectedText}
                                    </td>
                                    {section.id === "confidence" && (
                                      <td className="py-2 pr-3 align-top">
                                        <span
                                          className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold ${confidenceClass}`}
                                        >
                                          {confidenceText}
                                        </span>
                                      </td>
                                    )}
                                    <td className="py-2 pr-3 align-top text-[10px] text-gray-600 break-words whitespace-normal">
                                      {(() => {
                                        const visit = getVisitParts(d);
                                        return (
                                          <div className="space-y-0.5">
                                            <div>
                                              First visit:{" "}
                                              {formatDurationMs(visit.first)}
                                            </div>
                                            <div>
                                              Revisits ({visit.revisitCount}):{" "}
                                              {formatRevisitTimes(
                                                visit.revisits,
                                              )}
                                            </div>
                                            <div>
                                              Total visit time:{" "}
                                              {formatDurationMs(visit.total)}
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </td>
                                    <td className="py-2 pr-3 align-top text-[10px] text-gray-600 break-words whitespace-normal">
                                      <div className="space-y-0.5">
                                        <div>
                                          Changes: {getAnswerChangeCount(d)}{" "}
                                          times
                                        </div>
                                        <div>
                                          Sequence:{" "}
                                          {formatHistory(d.answerHistory)}
                                        </div>
                                        <div>Final: {selectedText}</div>
                                      </div>
                                    </td>
                                    <td className="py-2 pr-3 align-top">
                                      <span
                                        className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold ${labelClass}`}
                                      >
                                        {label}
                                      </span>
                                    </td>
                                    <td className="py-2 align-top font-semibold text-gray-900 tabular-nums">
                                      {formatMarks(d.marks)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
