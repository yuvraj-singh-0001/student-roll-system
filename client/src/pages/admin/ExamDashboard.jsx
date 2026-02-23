import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { analysisApi, examApi, olympiadExamApi } from "../../api";

const DETAIL_SECTION_GROUPS = [
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

export default function ExamDashboard() {
  const navigate = useNavigate();
  const [questionData, setQuestionData] = useState(null);
  const [studentResults, setStudentResults] = useState([]);
  const [totals, setTotals] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [examList, setExamList] = useState([]);
  const [examCode, setExamCode] = useState("");
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [detailsMeta, setDetailsMeta] = useState({ totalMarks: null });
  const [hoveredRow, setHoveredRow] = useState(null);
  const [time, setTime] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState(null);
  const [studentsPage, setStudentsPage] = useState(1);
  const [showTimeDetails, setShowTimeDetails] = useState(false);

  const STUDENTS_PAGE_SIZE = 4;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchExamList();
    return () => clearInterval(timer);
  }, []);

  const fetchExamList = async () => {
    try {
      setExamLoading(true);
      setExamError("");
      const { data: res } = await examApi.list();
      if (res.success) {
        const list = res.data || [];
        setExamList(list);
        if (!examCode && list.length) {
          setExamCode(list[0].examCode);
        }
        if (!list.length) {
          setLoading(false);
          setError("No olympiad exams found");
        }
      }
    } catch (e) {
      setExamError(e.response?.data?.message || "Failed to load exams list");
    } finally {
      setExamLoading(false);
    }
  };

  const fetchExamAnalytics = async (code, options = {}) => {
    const { silent = false } = options;
    try {
      if (!silent) {
        setLoading(true);
        setError("");
      }
      const [qRes, sRes] = await Promise.all([
        analysisApi.examQuestionHighlights({ examCode: code }),
        analysisApi.examStudentResults({ examCode: code }),
      ]);
      let didUpdate = false;
      if (qRes.data?.success) {
        setQuestionData(qRes.data.data);
        setTotals(qRes.data.data?.totals || null);
        setTotalQuestions(qRes.data.data?.totalQuestions || 0);
        didUpdate = true;
      }
      if (sRes.data?.success) {
        setStudentResults(sRes.data.data || []);
        setTotalStudents(sRes.data.totalStudents || 0);
        didUpdate = true;
      }
      if (didUpdate) {
        setLastUpdated(new Date());
      }
    } catch (e) {
      if (!silent) {
        setError(e.response?.data?.message || "Failed to load dashboard");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }; 

  useEffect(() => {
    if (!examCode) return;
    fetchExamAnalytics(examCode);
  }, [examCode]);

  useEffect(() => {
    setStudentsPage(1);
  }, [examCode]);

  const fetchStudentDetails = async (student) => {
    try {
      setDetailsLoading(true);
      setDetailsError("");
      setDetailsMeta({ totalMarks: null });
      if (student?.attemptId) {
        const { data: res } = await olympiadExamApi.attemptDetails(
          student.attemptId
        );
        if (res.success) {
          const normalized = normalizeAttemptAnswers(res.data?.answers || []);
          setStudentDetails(normalized);
          setDetailsMeta({ totalMarks: res.data?.totalMarks ?? null });
          return;
        }
      }

      const rawStudentId =
        typeof student?.studentId === "string"
          ? student.studentId.trim()
          : "";
      const isGuest = rawStudentId.startsWith("GUEST-") || rawStudentId === "null";
      if (rawStudentId && !isGuest) {
        const { data: res } = await analysisApi.studentExamDetails(
          rawStudentId,
          {
            examCode,
          }
        );
        if (res.success) {
          const normalized = normalizeAttemptAnswers(res.data || []);
          setStudentDetails(normalized);
          setDetailsMeta({ totalMarks: null });
          return;
        }
      }

      setStudentDetails([]);
      setDetailsMeta({ totalMarks: null });
    } catch (e) {
      setDetailsError(
        e.response?.data?.message || "Failed to load student details",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    fetchStudentDetails(student);
  };

  const closeDetailsModal = () => {
    setSelectedStudent(null);
    setStudentDetails([]);
    setDetailsMeta({ totalMarks: null });
  };

  const visibleDetails = useMemo(() => {
    const branchChoices = {};
    studentDetails.forEach((detail) => {
      if (detail.type !== "branch_parent") return;
      const answer = detail.studentAnswer;
      if (answer !== "A" && answer !== "B") return;
      branchChoices[String(detail.questionNumber)] = answer;
    });
    return studentDetails.filter((detail) => {
      if (detail.type !== "branch_child") return true;
      if (!detail.parentQuestion || !detail.branchKey) return true;
      const choice = branchChoices[String(detail.parentQuestion)];
      if (!choice) return false;
      return choice === detail.branchKey;
    });
  }, [studentDetails]);

  const sortedVisibleDetails = useMemo(
    () =>
      [...visibleDetails].sort(
        (a, b) => (a.questionNumber || 0) - (b.questionNumber || 0)
      ),
    [visibleDetails]
  );

  const detailSections = useMemo(
    () =>
      DETAIL_SECTION_GROUPS.map((section) => ({
        ...section,
        attempts: sortedVisibleDetails.filter((detail) =>
          section.types.includes(detail.type)
        ),
      })),
    [sortedVisibleDetails]
  );

  const branchParents = useMemo(
    () => sortedVisibleDetails.filter((detail) => detail.type === "branch_parent"),
    [sortedVisibleDetails]
  );

  const detailBlocks = useMemo(() => {
    const blocks = [];
    detailSections.forEach((section) => {
      blocks.push({ type: "section", section });
      if (section.id === "confidence" && branchParents.length > 0) {
        blocks.push({ type: "branch" });
      }
    });
    return blocks;
  }, [detailSections, branchParents.length]);

  const displayNumberMap = useMemo(() => {
    const map = new Map();
    let index = 1;
    sortedVisibleDetails.forEach((detail) => {
      if (detail.type === "branch_parent") return;
      map.set(detail.questionNumber, index);
      index += 1;
    });
    return map;
  }, [sortedVisibleDetails]);

  const getDisplayNumber = (detail) =>
    displayNumberMap.get(detail.questionNumber) ?? detail.questionNumber;

  const scoredDetails = useMemo(
    () => visibleDetails.filter((detail) => detail.type !== "branch_parent"),
    [visibleDetails]
  );

  const detailsSummary = useMemo(() => {
    const summary = {
      totalQuestions: scoredDetails.length,
      attempted: 0,
      skipped: 0,
      correct: 0,
      wrong: 0,
      totalMarks: 0,
    };

    for (const detail of scoredDetails) {
      if (detail.status === "attempted") summary.attempted += 1;
      if (detail.status === "skipped" || detail.status === "not_visited") {
        summary.skipped += 1;
      }
      if (detail.isCorrect === true) summary.correct += 1;
      if (detail.isCorrect === false && detail.status === "attempted") {
        summary.wrong += 1;
      }
      const marks = Number(detail.marks);
      if (Number.isFinite(marks)) summary.totalMarks += marks;
    }

    return summary;
  }, [scoredDetails]);

  const detailsTotalMarks = useMemo(() => {
    const metaMarks = Number(detailsMeta?.totalMarks);
    if (Number.isFinite(metaMarks)) return metaMarks;
    return detailsSummary.totalMarks;
  }, [detailsMeta, detailsSummary.totalMarks]);

  const displayValue = (value) => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed || trimmed === "-") return "null";
    }
    return value;
  };

  const normalizeAttemptAnswers = (answers) => {
    if (!Array.isArray(answers)) return [];
    return answers.map((a) => ({
      questionNumber: a.questionNumber,
      question: a.questionText ?? a.question ?? "-",
      correctAnswer: a.correctAnswer ?? "-",
      correctAnswers: Array.isArray(a.correctAnswers) ? a.correctAnswers : [],
      studentAnswer: a.selectedAnswer ?? a.studentAnswer ?? "-",
      studentAnswers: Array.isArray(a.selectedAnswers)
        ? a.selectedAnswers
        : Array.isArray(a.studentAnswers)
        ? a.studentAnswers
        : [],
      isCorrect: a.isCorrect,
      status: a.status,
      confidenceLevel: a.confidence ?? a.confidenceLevel ?? null,
      marks: a.marks,
      marksReason: a.marksReason || "",
      type: a.type,
      parentQuestion: a.parentQuestion,
      branchKey: a.branchKey,
      firstVisitMs: a.firstVisitMs ?? null,
      revisitChangeMs: Array.isArray(a.revisitChangeMs) ? a.revisitChangeMs : [],
      visitDurationsMs: Array.isArray(a.visitDurationsMs) ? a.visitDurationsMs : [],
      totalTimeMs:
        Number.isFinite(Number(a.totalTimeMs)) && Number(a.totalTimeMs) >= 0
          ? Number(a.totalTimeMs)
          : null,
      answerHistory: Array.isArray(a.answerHistory) ? a.answerHistory : [],
      answerChangeCount:
        Number.isFinite(Number(a.answerChangeCount)) && Number(a.answerChangeCount) >= 0
          ? Math.floor(Number(a.answerChangeCount))
          : Array.isArray(a.answerHistory)
          ? a.answerHistory.length
          : 0,
    }));
  };

  const formatAnswer = (answers, fallback) => {
    if (Array.isArray(answers) && answers.length) {
      return answers.join(", ");
    }
    if (fallback === 0) return "0";
    if (fallback !== null && fallback !== undefined) {
      const text = String(fallback);
      if (text.trim()) return displayValue(text);
    }
    return "null";
  };

  const formatMarks = (value) => {
    if (value === null || value === undefined) return "null";
    const num = Number(value);
    if (!Number.isFinite(num)) return "null";
    return num.toFixed(2);
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

  const formatPercent = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "-";
    return `${num.toFixed(1)}%`;
  };

  const formatAvgChanges = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "-";
    return num.toFixed(2);
  };

  const formatHistory = (history) => {
    if (!Array.isArray(history) || history.length === 0) return "-";
    return history
      .map((v) => (typeof v === "string" && v.trim() ? v.trim() : "-"))
      .join(" -> ");
  };

  const getAnswerChangeCount = (detail) => {
    let baseCount = null;
    if (Number.isFinite(Number(detail.answerChangeCount))) {
      baseCount = Math.max(0, Math.floor(Number(detail.answerChangeCount)));
    } else if (Array.isArray(detail.answerHistory)) {
      baseCount = detail.answerHistory.length;
    }
    if (baseCount === null) return 0;
    return Math.max(baseCount - 1, 0);
  };

  const getStudentScore = (student) => {
    const candidates = [
      student?.totalScore,
      student?.totalMarks,
      student?.score,
      student?.marks,
    ];
    for (const candidate of candidates) {
      const num = Number(candidate);
      if (Number.isFinite(num)) return num;
    }
    return null;
  };

  const getConfidenceMeta = (level) => {
    const val = String(level || "").toLowerCase();
    if (val === "high" || val === "full") {
      return { label: "High", badge: "bg-emerald-100 text-emerald-800" };
    }
    if (val === "mid" || val === "middle" || val === "medium") {
      return { label: "Mid", badge: "bg-amber-100 text-amber-800" };
    }
    if (val === "low") {
      return { label: "Low", badge: "bg-rose-100 text-rose-800" };
    }
    return { label: "-", badge: "bg-slate-100 text-slate-700" };
  };

  const getResultMeta = (detail) => {
    const isSkipped =
      detail.status === "skipped" || detail.status === "not_visited";
    if (isSkipped) {
      return {
        label: "Skipped",
        row: "bg-amber-50/70",
        badge: "bg-amber-100 text-amber-800",
      };
    }
    if (detail.type === "branch_parent") {
      return {
        label: "No Marks",
        row: "bg-slate-50/60",
        badge: "bg-slate-100 text-slate-700",
      };
    }
    if (detail.isCorrect === true) {
      return {
        label: "Correct",
        row: "bg-emerald-50/70",
        badge: "bg-emerald-100 text-emerald-800",
      };
    }
    if (detail.isCorrect === false) {
      if (Number(detail.marks) > 0) {
        return {
          label: "Partial",
          row: "bg-sky-50/70",
          badge: "bg-sky-100 text-sky-800",
        };
      }
      return {
        label: "Wrong",
        row: "bg-rose-50/70",
        badge: "bg-rose-100 text-rose-800",
      };
    }
    return {
      label: "Attempted",
      row: "bg-blue-50/60",
      badge: "bg-blue-100 text-blue-700",
    };
  };

  const qw = questionData?.highlights || null;
  const branchSummary = questionData?.branchSummary || [];
  const timeAnalysis = questionData?.timeAnalysis || null;
  const timeHighlights = timeAnalysis?.highlights || {};
  const timeList = Array.isArray(timeAnalysis?.list) ? timeAnalysis.list : [];
  const attemptedStudents = Number.isFinite(Number(questionData?.totalStudents))
    ? Number(questionData?.totalStudents)
    : Number.isFinite(Number(totalStudents))
    ? Number(totalStudents)
    : 0;
  const attemptedStudentsSafe = attemptedStudents > 0 ? attemptedStudents : 0;
  const formatPercentOfAttempted = (count) => {
    if (!attemptedStudentsSafe) return "-";
    const num = Number(count) || 0;
    return formatPercent((num / attemptedStudentsSafe) * 100);
  };
  const st = studentResults || [];

  const selectedExamMeta = examList.find((e) => e.examCode === examCode);
  const displayTotalQuestions = useMemo(() => {
    const count = Number(totalQuestions);
    return Number.isFinite(count) && count >= 0 ? count : 0;
  }, [totalQuestions]);
  const questionsPerStudent = useMemo(() => {
    const apiCount = Number(questionData?.questionsPerStudent);
    if (Number.isFinite(apiCount) && apiCount >= 0) return apiCount;
    const metaCount = Number(selectedExamMeta?.totalQuestions);
    if (Number.isFinite(metaCount) && metaCount > 0) return metaCount;
    const uniqueCount = Number(questionData?.uniqueQuestions);
    if (Number.isFinite(uniqueCount) && uniqueCount >= 0) return uniqueCount;
    return 0;
  }, [selectedExamMeta, questionData]);

  const studentsTotal = st.length;
  const studentsTotalPages = Math.max(
    1,
    Math.ceil(studentsTotal / STUDENTS_PAGE_SIZE)
  );
  const studentsPageSafe = Math.min(studentsPage, studentsTotalPages);
  const studentsStart =
    studentsTotal === 0
      ? 0
      : (studentsPageSafe - 1) * STUDENTS_PAGE_SIZE + 1;
  const studentsEnd = Math.min(
    studentsPageSafe * STUDENTS_PAGE_SIZE,
    studentsTotal
  );

  const pagedStudents = useMemo(() => {
    const start = (studentsPageSafe - 1) * STUDENTS_PAGE_SIZE;
    return st.slice(start, start + STUDENTS_PAGE_SIZE);
  }, [st, studentsPageSafe]);

  const studentsPages = useMemo(
    () => Array.from({ length: studentsTotalPages }, (_, i) => i + 1),
    [studentsTotalPages]
  );
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-24 animate-fade-in-up">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 animate-pulse">
            Loading exam analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center py-24 animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center max-w-md">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
            <span className="text-2xl text-red-600">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Unable to Load Data
          </h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/admin")}
            className="group px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            <span>Back to Admin Panel</span>
          </button>
        </div>
      </div>
    );
  }

  
  return (
    <div className="relative w-full animate-[slideIn_0.45s_ease-out]">
      {/* Top sub-header (optional small info) */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Olympiad Analytics Overview
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Live exam performance metrics |{" "}
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {lastUpdated && (
              <span className="text-gray-400">
                {" "}| Updated{" "}
                {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={examCode}
              onChange={(e) => setExamCode(e.target.value)}
              disabled={examLoading || !examList.length}
              className="px-3 py-1.5 pr-8 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {examList.length ? (
                examList.map((ex) => (
                  <option key={ex.examCode} value={ex.examCode}>
                    {ex.title || ex.examCode} ({ex.examCode})
                  </option>
                ))
              ) : (
                <option value="">No exams</option>
              )}
            </select>
          </div>
          <button
            onClick={() => examCode && fetchExamAnalytics(examCode)}
            className="group px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
          >
            <span className="group-hover:rotate-180 transition-transform duration-300">
              ↻
            </span>
            <span>Refresh</span>
          </button>
        </div>
      </div>
      {examError && (
        <div className="mb-2 p-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
          {examError}
        </div>
      )}

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        {[
          {
            label: "Total Students Attempted",
            value: totalStudents ?? 0,
            icon: "👥",
            color: "from-blue-500 to-cyan-500",
          },
          {
            label: "Total Questions",
            value: displayTotalQuestions,
            icon: "📋",
            color: "from-purple-500 to-pink-500",
          },
          {
            label: "Attempted",
            value: totals?.attempted ?? 0,
            icon: "✓",
            color: "from-green-500 to-emerald-500",
          },
          {
            label: "Skipped",
            value: totals?.skipped ?? 0,
            icon: "⏭️",
            color: "from-orange-500 to-amber-500",
          },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="group relative bg-white rounded-xl shadow-md border border-gray-100 p-2 hover:shadow-lg transition-all duration-500 hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <span className="text-base text-white">{stat.icon}</span>
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-gray-500">{stat.label}</div>
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            ></div>
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid lg:grid-cols-3 gap-2 mb-2">
        {/* Correct vs Wrong */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
          <div className="p-2">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Performance Analysis
            </h2>
            <div className="flex gap-2">
              <div className="flex-1 p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-xl font-bold text-green-700 mb-1.5">
                  {totals?.correct ?? 0}
                </div>
                <div className="text-xs font-medium text-green-600">
                  Correct Answers
                </div>
                <div className="mt-2 w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"></div>
              </div>
              <div className="flex-1 p-2 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100 text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-xl font-bold text-red-700 mb-1.5">
                  {totals?.wrong ?? 0}
                </div>
                <div className="text-xs font-medium text-red-600">
                  Wrong Answers
                </div>
                <div className="mt-2 w-12 h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-full mx-auto"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Olympiad Info */}
        <div
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <div className="p-2">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Olympiad Exam Info
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center justify-between p-2 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                <span className="text-gray-600">Exam Code</span>
                <span className="font-semibold">{examCode || "-"}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                <span className="text-gray-600">Title</span>
                <span className="font-semibold">{selectedExamMeta?.title || "-"}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                <span className="text-gray-600">Total Questions</span>
                <span className="font-semibold">{displayTotalQuestions}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                <span className="text-gray-600">Questions / Student</span>
                <span className="font-semibold">{questionsPerStudent}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                <span className="text-gray-600">Total Students</span>
                <span className="font-semibold">{totalStudents ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question-wise Analysis */}
      {qw && (
        <div
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-2 animate-fade-in-up"
          style={{ animationDelay: "0.25s" }}
        >
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <div className="p-2">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Question-wise Analysis
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="group p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-xs text-gray-600 mb-1">
                  Most Attempted
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {qw.mostAttempted ? `Q${qw.mostAttempted.questionNumber}` : "�"}
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  {qw.mostAttempted?.attempted ?? 0} attempts
                </div>
              </div>

              <div className="group p-2 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-xs text-gray-600 mb-1">Most Wrong</div>
                <div className="text-lg font-bold text-gray-900">
                  {qw.mostWrong ? `Q${qw.mostWrong.questionNumber}` : "�"}
                </div>
                <div className="text-xs text-red-600 font-medium">
                  {qw.mostWrong?.wrong ?? 0} wrong
                </div>
              </div>
              <div className="group p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-xs text-gray-600 mb-1">Most Correct</div>
                <div className="text-lg font-bold text-gray-900">
                  {qw.mostCorrect ? `Q${qw.mostCorrect.questionNumber}` : "�"}
                </div>
                <div className="text-xs text-green-600 font-medium">
                  {qw.mostCorrect?.correct ?? 0} correct
                </div>
              </div>
              <div className="group p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-xs text-gray-600 mb-1">Most Skipped</div>
                <div className="text-lg font-bold text-gray-900">
                  {qw.mostSkipped ? `Q${qw.mostSkipped.questionNumber}` : "�"}
                </div>
                <div className="text-xs text-purple-600 font-medium">
                  {qw.mostSkipped?.skipped ?? 0} skipped
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {timeAnalysis && timeList.length > 0 && (
        <div
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-2 animate-fade-in-up"
          style={{ animationDelay: "0.27s" }}
        >
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="p-2">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Time-wise Analysis
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
              <div className="group p-2 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-xs text-gray-600 mb-1">
                  Slowest Select Time (Avg)
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {timeHighlights.mostSelectTime
                    ? `Q${timeHighlights.mostSelectTime.questionNumber}`
                    : "-"}
                </div>
                <div className="text-xs text-emerald-700 font-medium">
                  {timeHighlights.mostSelectTime?.selectAvgMs !== null
                    ? `Average: ${formatDurationMs(
                        timeHighlights.mostSelectTime.selectAvgMs
                      )}`
                    : "Average: -"}{" "}
                  {timeHighlights.mostSelectTime?.selectCount
                    ? `(n=${timeHighlights.mostSelectTime.selectCount})`
                    : ""}
                </div>
              </div>

              <div className="group p-2 bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl border border-cyan-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-xs text-gray-600 mb-1">
                  Fastest Select Time (Avg)
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {timeHighlights.leastSelectTime
                    ? `Q${timeHighlights.leastSelectTime.questionNumber}`
                    : "-"}
                </div>
                <div className="text-xs text-cyan-700 font-medium">
                  {timeHighlights.leastSelectTime?.selectAvgMs !== null
                    ? `Average: ${formatDurationMs(
                        timeHighlights.leastSelectTime.selectAvgMs
                      )}`
                    : "Average: -"}{" "}
                  {timeHighlights.leastSelectTime?.selectCount
                    ? `(n=${timeHighlights.leastSelectTime.selectCount})`
                    : ""}
                </div>
              </div>

              <div className="group p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-xs text-gray-600 mb-1">
                  Slowest Skip Time (Avg)
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {timeHighlights.mostSkipTime
                    ? `Q${timeHighlights.mostSkipTime.questionNumber}`
                    : "-"}
                </div>
                <div className="text-xs text-amber-700 font-medium">
                  {timeHighlights.mostSkipTime?.skipAvgMs !== null
                    ? `Average: ${formatDurationMs(
                        timeHighlights.mostSkipTime.skipAvgMs
                      )}`
                    : "Average: -"}{" "}
                  {timeHighlights.mostSkipTime?.skipCount
                    ? `(n=${timeHighlights.mostSkipTime.skipCount})`
                    : ""}
                </div>
              </div>

              <div className="group p-2 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-xs text-gray-600 mb-1">
                  Fastest Skip Time (Avg)
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {timeHighlights.leastSkipTime
                    ? `Q${timeHighlights.leastSkipTime.questionNumber}`
                    : "-"}
                </div>
                <div className="text-xs text-amber-700 font-medium">
                  {timeHighlights.leastSkipTime?.skipAvgMs !== null
                    ? `Average: ${formatDurationMs(
                        timeHighlights.leastSkipTime.skipAvgMs
                      )}`
                    : "Average: -"}{" "}
                  {timeHighlights.leastSkipTime?.skipCount
                    ? `(n=${timeHighlights.leastSkipTime.skipCount})`
                    : ""}
                </div>
              </div>

              <div className="group p-2 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-xs text-gray-600 mb-1">
                  Most Answer Changes (Avg)
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {timeHighlights.mostChanges
                    ? `Q${timeHighlights.mostChanges.questionNumber}`
                    : "-"}
                </div>
                <div className="text-xs text-purple-700 font-medium">
                  {timeHighlights.mostChanges?.changeAvg !== null
                    ? `Average changes: ${formatAvgChanges(
                        timeHighlights.mostChanges.changeAvg
                      )}`
                    : "Average changes: -"}
                </div>
              </div>

                <div className="group p-2 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                  <div className="text-xs text-gray-600 mb-1">
                    Least Answer Changes (Avg)
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {timeHighlights.leastChanges
                      ? `Q${timeHighlights.leastChanges.questionNumber}`
                      : "-"}
                  </div>
                  <div className="text-xs text-gray-700 font-medium">
                    {timeHighlights.leastChanges?.changeAvg !== null
                      ? `Average changes: ${formatAvgChanges(
                          timeHighlights.leastChanges.changeAvg
                        )}`
                      : "Average changes: -"}
                  </div>
                </div>

                <div className="group p-2 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                  <div className="text-xs text-gray-600 mb-1">
                    Correct → Wrong (Most)
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {timeHighlights.mostCorrectToWrong
                      ? `Q${timeHighlights.mostCorrectToWrong.questionNumber}`
                      : "-"}
                  </div>
                  <div className="text-xs text-rose-700 font-medium">
                    {timeHighlights.mostCorrectToWrong
                      ? `Count: ${timeHighlights.mostCorrectToWrong.correctToWrongCount} (${formatPercentOfAttempted(
                          timeHighlights.mostCorrectToWrong.correctToWrongCount
                        )}${
                          attemptedStudentsSafe
                            ? `, ${timeHighlights.mostCorrectToWrong.correctToWrongCount}/${attemptedStudentsSafe} students`
                            : ""
                        })`
                      : "-"}
                  </div>
                </div>

                <div className="group p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                  <div className="text-xs text-gray-600 mb-1">
                    Wrong → Correct (Most)
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {timeHighlights.mostWrongToCorrect
                      ? `Q${timeHighlights.mostWrongToCorrect.questionNumber}`
                      : "-"}
                  </div>
                  <div className="text-xs text-emerald-700 font-medium">
                    {timeHighlights.mostWrongToCorrect
                      ? `Count: ${timeHighlights.mostWrongToCorrect.wrongToCorrectCount} (${formatPercentOfAttempted(
                          timeHighlights.mostWrongToCorrect.wrongToCorrectCount
                        )}${
                          attemptedStudentsSafe
                            ? `, ${timeHighlights.mostWrongToCorrect.wrongToCorrectCount}/${attemptedStudentsSafe} students`
                            : ""
                        })`
                      : "-"}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowTimeDetails((prev) => !prev)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  {showTimeDetails ? "Hide Depth Analysis" : "Depth Analysis"}
                </button>
              </div>

              {showTimeDetails && (
                <div className="mt-3 rounded-xl border border-gray-200 overflow-x-auto">
                  <div className="px-3 py-2 text-[11px] text-gray-600 bg-gray-50 border-b border-gray-200">
                    This table summarizes time and change behavior for each
                    question. "Avg Select Time" means the average time to select
                    an answer the first time, and "Avg Skip Time" means the
                    average time before skipping. The Changes and Behavior
                    columns show percentage with total count (students who
                    attempted the exam). Example: 20% = 2/10 students.
                  </div>
                  <table className="min-w-[1300px] w-full text-[11px] text-gray-700">
                    <thead className="bg-gradient-to-r from-emerald-50 to-teal-50">
                      <tr className="text-left text-[11px] text-gray-600">
                        <th className="px-2 py-2 font-medium">Q.No</th>
                        <th className="px-2 py-2 font-medium">Question</th>
                        <th className="px-2 py-2 font-medium">
                          Avg Select Time
                          <div className="text-[10px] text-gray-500">
                            Average time to select first answer
                          </div>
                        </th>
                        <th className="px-2 py-2 font-medium">
                          Avg Skip Time
                          <div className="text-[10px] text-gray-500">
                            Average time before skipping
                          </div>
                        </th>
                        <th className="px-2 py-2 font-medium">
                          Changes %
                          <div className="text-[10px] text-gray-500">
                            % of attempted students who changed answers
                          </div>
                        </th>
                        <th className="px-2 py-2 font-medium">
                          Wrong → Correct
                          <div className="text-[10px] text-gray-500">
                            From attempted students (count + %)
                          </div>
                        </th>
                        <th className="px-2 py-2 font-medium">
                          Correct → Wrong
                          <div className="text-[10px] text-gray-500">
                            From attempted students (count + %)
                          </div>
                        </th>
                        
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {timeList.map((row) => (
                        <tr key={`time-${row.questionNumber}`}>
                          <td className="px-2 py-2 font-semibold text-gray-900">
                            Q{row.questionNumber}
                          </td>
                          <td className="px-2 py-2 text-gray-700">
                            {row.questionText || "-"}
                          </td>
                          <td className="px-2 py-2">
                            {row.selectAvgMs !== null
                              ? `${formatDurationMs(row.selectAvgMs)} (n=${row.selectCount || 0})`
                              : "-"}
                          </td>
                          <td className="px-2 py-2">
                            {row.skipAvgMs !== null
                              ? `${formatDurationMs(row.skipAvgMs)} (n=${row.skipCount || 0})`
                              : "-"}
                          </td>
                          <td className="px-2 py-2">
                            {attemptedStudentsSafe
                              ? `${formatPercent(
                                  ((row.changeStudents || 0) / attemptedStudentsSafe) *
                                    100
                                )} (${row.changeStudents || 0}/${
                                  attemptedStudentsSafe
                                } students)`
                              : "-"}
                          </td>
                          <td className="px-2 py-2">
                            {attemptedStudentsSafe
                              ? `${formatPercent(
                                  ((row.wrongToCorrectCount || 0) / attemptedStudentsSafe) *
                                    100
                                )} (${row.wrongToCorrectCount || 0}/${
                                  attemptedStudentsSafe
                                } students)`
                              : "-"}
                          </td>
                          <td className="px-2 py-2">
                            {attemptedStudentsSafe
                              ? `${formatPercent(
                                  ((row.correctToWrongCount || 0) / attemptedStudentsSafe) *
                                    100
                                )} (${row.correctToWrongCount || 0}/${
                                  attemptedStudentsSafe
                                } students)`
                              : "-"}
                          </td>
                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        </div>
      )}

      {Array.isArray(branchSummary) && branchSummary.length > 0 && (
        <div
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-2 animate-fade-in-up"
          style={{ animationDelay: "0.28s" }}
        >
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Branch Decision Summary
                </h2>
                <p className="text-xs text-gray-500">
                  Question X selections (A vs B)
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200">
              <table className="w-full text-sm table-fixed">
                <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                  <tr>
                    <th className="px-2 py-1.5 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-2 py-1.5 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                      A Selected
                    </th>
                    <th className="px-2 py-1.5 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                      B Selected
                    </th>
                    <th className="px-2 py-1.5 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {branchSummary.map((row, idx) => {
                    const total =
                      (row.selectedA || 0) +
                      (row.selectedB || 0);
                    return (
                      <tr
                        key={`${row.questionNumber}-${idx}`}
                        className="hover:bg-amber-50/40 transition-colors"
                      >
                        <td className="px-2 py-1.5 font-medium text-gray-900 break-words">
                          Q{row.questionNumber}
                          <div className="text-xs text-gray-500">
                            {row.questionText || "-"}
                          </div>
                        </td>
                        <td className="px-2 py-1.5">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {row.selectedA || 0}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                            {row.selectedB || 0}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 font-semibold text-gray-900">
                          {total}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Student-wise Results Table */}
      <div
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="h-1 bg-gradient-to-r from-gray-800 to-gray-900"></div>
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Student-wise Results
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing {studentsStart}-{studentsEnd} of {studentsTotal} students
              </p>
            </div>
          </div>

          {Array.isArray(st) && st.length > 0 ? (
            <div className="rounded-xl border border-gray-200">
              <table className="w-full text-sm table-fixed">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-2 py-1.5 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-2 py-1.5 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-2 py-1.5 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                      Attempted
                    </th>
                    <th className="px-2 py-1.5 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                      Skipped
                    </th>
                    <th className="px-2 py-1.5 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                      Correct / Wrong
                    </th>
                    <th className="px-2 py-1.5 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-2 py-1.5 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pagedStudents.map((student, idx) => {
                    const scoreValue = getStudentScore(student);
                    return (
                      <tr
                        key={`${student.studentId}-${idx}`}
                        onMouseEnter={() => setHoveredRow(student.studentId)}
                        onMouseLeave={() => setHoveredRow(null)}
                        className={`group transition-all duration-300 ${
                          hoveredRow === student.studentId
                            ? "bg-gradient-to-r from-blue-50/50 to-transparent transform scale-[1.002]"
                            : "hover:bg-gray-50"
                        }`}
                      >
                      <td className="px-2 py-1.5">
                        <div className="font-semibold text-gray-900">
                          {displayValue(student.name)}
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-xs text-gray-500 font-mono">
                        {displayValue(student.studentId)}
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full inline-flex w-fit">
                          {displayValue(student.attempted)}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full inline-flex w-fit">
                          {displayValue(student.skipped)}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600 font-medium">
                            C {displayValue(student.correct)}
                          </span>
                          <span className="text-gray-400">/</span>
                          <span className="text-rose-600 font-medium">
                            W {displayValue(student.wrong)}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <span
                          className={`font-bold ${
                            scoreValue >= 80
                              ? "text-green-600"
                                : scoreValue >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatMarks(scoreValue)}
                          </span>
                        </td>
                      <td className="px-2 py-1.5">
                        <button
                          onClick={() => handleViewDetails(student)}
                          aria-label="View details"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                        >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-4 h-4"
                              aria-hidden="true"
                            >
                              <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-2xl text-gray-500">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Exam Attempts Yet
              </h3>
              <p className="text-gray-500">
                Students haven't attempted any exams yet.
              </p>
            </div>
          )}

          {studentsTotalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
              <div className="text-xs text-gray-500">
                Page {studentsPageSafe} of {studentsTotalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setStudentsPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={studentsPageSafe === 1}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    studentsPageSafe === 1
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Prev
                </button>
                {studentsPages.map((page) => (
                  <button
                    key={page}
                    onClick={() => setStudentsPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      page === studentsPageSafe
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setStudentsPage((prev) =>
                      Math.min(studentsTotalPages, prev + 1)
                    )
                  }
                  disabled={studentsPageSafe === studentsTotalPages}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    studentsPageSafe === studentsTotalPages
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-[slideIn_0.35s_ease-out]">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Exam Details - {displayValue(selectedStudent.name)}
                </h2>
                <p className="text-sm text-gray-300">
                  Student ID: {displayValue(selectedStudent.studentId)}
                </p>
              </div>
              <button
                onClick={closeDetailsModal}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300"
              >
                <span className="text-xl font-bold">×</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {detailsLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600">Loading detailed results...</p>
                </div>
              ) : detailsError ? (
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200 p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                    <span className="text-2xl text-red-600">⚠️</span>
                  </div>
                  <p className="text-red-700 font-medium">{detailsError}</p>
                </div>
              ) : studentDetails.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Detailed Result
                      </h3>
                      <p className="text-xs text-gray-500">
                        Total {detailsSummary.totalQuestions} questions
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                      <div className="text-[11px] text-gray-500">Total Questions</div>
                      <div className="text-lg font-bold text-gray-900">
                        {detailsSummary.totalQuestions}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                      <div className="text-[11px] text-gray-500">Attempted</div>
                      <div className="text-lg font-bold text-blue-700">
                        {detailsSummary.attempted}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                      <div className="text-[11px] text-gray-500">Skipped</div>
                      <div className="text-lg font-bold text-amber-700">
                        {detailsSummary.skipped}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                      <div className="text-[11px] text-gray-500">Correct</div>
                      <div className="text-lg font-bold text-emerald-700">
                        {detailsSummary.correct}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                      <div className="text-[11px] text-gray-500">Wrong</div>
                      <div className="text-lg font-bold text-rose-700">
                        {detailsSummary.wrong}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                      <div className="text-[11px] text-gray-500">Total Marks</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatMarks(detailsTotalMarks)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {detailBlocks.map((block, blockIndex) => {
                      if (block.type === "branch") {
                        return (
                          <div
                            key={`branch-block-${blockIndex}`}
                            className="rounded-xl border border-amber-200 bg-amber-50/40 p-3"
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
                                  className="rounded-lg border border-amber-200 bg-white px-3 py-2"
                                >
                                  <div className="font-semibold text-gray-900">
                                    Question X
                                  </div>
                                  <div className="text-gray-700 mt-0.5">
                                    {displayValue(bp.question)}
                                  </div>
                                  <div className="text-[11px] text-gray-600 mt-1">
                                    Selected:{" "}
                                    <span className="font-semibold text-gray-900">
                                      {displayValue(bp.studentAnswer)}
                                    </span>
                                  </div>
                                  <div className="mt-1 space-y-0.5 text-[10px] text-gray-600">
                                    <div>
                                      First visit: {formatDurationMs(bp.firstVisitMs)}
                                    </div>
                                    <div>
                                      Visits: {formatDurationList(bp.visitDurationsMs)}
                                    </div>
                                    <div>
                                      Total time: {formatDurationMs(bp.totalTimeMs)}
                                    </div>
                                    <div>
                                      Revisit change: {formatDurationList(bp.revisitChangeMs)}
                                    </div>
                                    <div>Changes: {getAnswerChangeCount(bp)}</div>
                                    <div>History: {formatHistory(bp.answerHistory)}</div>
                                  </div>
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
                          className="rounded-xl border border-gray-200 bg-white p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {section.title}
                            </h4>
                            <span className="text-[11px] text-gray-600">
                              {section.attempts.length} Question
                              {section.attempts.length > 1 ? "s" : ""}
                            </span>
                          </div>

                          {section.attempts.length === 0 ? (
                            <p className="text-xs text-gray-500">
                              No questions found in this section.
                            </p>
                          ) : (
                            <div className="rounded-lg border border-gray-200 overflow-x-auto">
                              <table className="min-w-[1200px] w-full text-[11px] text-gray-700">
                                <thead className="bg-gray-50">
                                  <tr className="text-left text-[11px] text-gray-500">
                                    <th className="px-2 py-2 font-medium">Q.No</th>
                                    <th className="px-2 py-2 font-medium">
                                      Question
                                    </th>
                                    <th className="px-2 py-2 font-medium">
                                      Correct Answer
                                    </th>
                                    <th className="px-2 py-2 font-medium">
                                      Student Answer
                                    </th>
                                    {section.id === "confidence" && (
                                      <th className="px-2 py-2 font-medium">
                                        Confidence
                                      </th>
                                    )}
                                    <th className="px-2 py-2 font-medium">
                                      Timing
                                    </th>
                                    <th className="px-2 py-2 font-medium">
                                      Answer History
                                    </th>
                                    <th className="px-2 py-2 font-medium">
                                      Result
                                    </th>
                                    <th className="px-2 py-2 font-medium">
                                      Marks
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {section.attempts.map((detail, idx) => {
                                    const studentAnswerText = formatAnswer(
                                      detail.studentAnswers,
                                      detail.studentAnswer
                                    );
                                    const correctAnswerText = formatAnswer(
                                      detail.correctAnswers,
                                      detail.correctAnswer
                                    );
                                    const resultMeta = getResultMeta(detail);
                                    const confidenceMeta = getConfidenceMeta(
                                      detail.confidenceLevel
                                    );

                                    return (
                                      <tr
                                        key={`${section.id}-${detail.questionNumber}-${idx}`}
                                        className={`${resultMeta.row} transition-colors`}
                                      >
                                        <td className="px-2 py-2 align-top font-semibold text-gray-900">
                                          Q{getDisplayNumber(detail)}
                                        </td>
                                        <td className="px-2 py-2 align-top text-gray-700 break-words whitespace-normal">
                                          <div>
                                            {displayValue(detail.question)}
                                          </div>
                                          <div className="text-[10px] text-gray-500 mt-1">
                                            Marks Reason:{" "}
                                            {displayValue(detail.marksReason)}
                                          </div>
                                        </td>
                                        <td className="px-2 py-2 align-top text-gray-700 break-words whitespace-normal">
                                          {correctAnswerText}
                                        </td>
                                        <td className="px-2 py-2 align-top text-gray-700 break-words whitespace-normal">
                                          {studentAnswerText}
                                        </td>
                                        {section.id === "confidence" && (
                                          <td className="px-2 py-2 align-top">
                                            <span
                                              className={`px-2 py-1 rounded-full text-[10px] font-semibold ${confidenceMeta.badge}`}
                                            >
                                              {confidenceMeta.label}
                                            </span>
                                          </td>
                                        )}
                                        <td className="px-2 py-2 align-top text-[10px] text-gray-600 break-words whitespace-normal">
                                          <div className="space-y-0.5">
                                            <div>
                                              First: {formatDurationMs(detail.firstVisitMs)}
                                            </div>
                                            <div>
                                              Visits:{" "}
                                              {formatDurationList(detail.visitDurationsMs)}
                                            </div>
                                            <div>
                                              Total: {formatDurationMs(detail.totalTimeMs)}
                                            </div>
                                            <div>
                                              Revisit change:{" "}
                                              {formatDurationList(detail.revisitChangeMs)}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-2 py-2 align-top text-[10px] text-gray-600 break-words whitespace-normal">
                                          <div className="space-y-0.5">
                                            <div>
                                              Changes: {getAnswerChangeCount(detail)}
                                            </div>
                                            <div>Seq: {formatHistory(detail.answerHistory)}</div>
                                          </div>
                                        </td>
                                        <td className="px-2 py-2 align-top">
                                          <span
                                            className={`px-2 py-1 rounded-full text-[10px] font-semibold ${resultMeta.badge}`}
                                          >
                                            {resultMeta.label}
                                          </span>
                                        </td>
                                        <td className="px-2 py-2 align-top font-semibold text-gray-900">
                                          {formatMarks(detail.marks)}
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
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-2xl text-gray-500">📄</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Exam Details Found
                  </h3>
                  <p className="text-gray-500">
                    No exam attempt details available for this student.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeDetailsModal}
                className="px-6 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}














































































































