import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { questionApi, examApi, olympiadExamApi } from "../../api";
import { setExamQuestions } from "../../store/examSlice";

const EXAM_CACHE_KEY = "examListCacheV1";
const EXAM_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const EXAM_QUESTIONS_CACHE_TTL_MS = 10 * 60 * 1000;

const getExamCacheKey = (studentIdentifier = "") => {
  const safeId = String(studentIdentifier || "").trim() || "anonymous";
  return `${EXAM_CACHE_KEY}:${safeId}`;
};

const getQuestionsCacheKey = (examCode, mockTestCode = "") => {
  const code = String(examCode || "").trim();
  if (!code) return "";
  const mock = String(mockTestCode || "").trim();
  return mock
    ? `examQuestionsCacheV1:${code}:mock:${mock}`
    : `examQuestionsCacheV1:${code}`;
};

const getExamStoreKey = (examCode, mockTestCode = "") => {
  const code = String(examCode || "").trim();
  if (!code) return "";
  const mock = String(mockTestCode || "").trim();
  return mock ? `${code}::mock:${mock}` : code;
};

const readExamListCache = (cacheKey, options = {}) => {
  if (typeof window === "undefined") return null;
  const allowStale = options.allowStale === true;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.data) || !parsed.ts) return null;
    const ageMs = Date.now() - parsed.ts;
    if (!allowStale && ageMs > EXAM_CACHE_TTL_MS) return null;
    return { data: parsed.data, isStale: ageMs > EXAM_CACHE_TTL_MS };
  } catch {
    return null;
  }
};

const writeExamListCache = (cacheKey, list) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ data: Array.isArray(list) ? list : [], ts: Date.now() }),
    );
  } catch {
    // ignore cache write errors
  }
};

const readQuestionsCache = (examCode, options = {}) => {
  if (typeof window === "undefined") return null;
  const allowStale = options.allowStale === true;
  const key = getQuestionsCacheKey(examCode, options.mockTestCode);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.ts || !parsed.data) return null;
    const ageMs = Date.now() - parsed.ts;
    if (!allowStale && ageMs > EXAM_QUESTIONS_CACHE_TTL_MS) return null;
    return { data: parsed.data, isStale: ageMs > EXAM_QUESTIONS_CACHE_TTL_MS };
  } catch {
    return null;
  }
};

const writeQuestionsCache = (examCode, data, options = {}) => {
  if (typeof window === "undefined") return;
  const key = getQuestionsCacheKey(examCode, options.mockTestCode);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // ignore cache write errors
  }
};

const CONFIDENCE_OPTS = [
  {
    value: "high",
    label: "High Confidence",
    color: "from-green-500 to-emerald-500",
  },
  {
    value: "mid",
    label: "Medium Confidence",
    color: "from-yellow-500 to-amber-500",
  },
  { value: "low", label: "Low Confidence", color: "from-red-500 to-rose-500" },
];

const CONFIDENCE_REQUIRED_ERROR =
  "Please select a confidence level before moving to the next question.";

const SECTION_INFO = {
  simple: {
    title: "Conventional MCQs",
    blocks: [
      {
        type: "list",
        items: ["Every question will have only one correct option as answer."],
      },
    ],
  },
  multiple: {
    title: "Multiple Correct Answers MCQs",
    blocks: [
      {
        type: "list",
        items: [
          "Questions in this category may have one or more correct options, up to all four.",
          "Candidates are required to select all correct options.",
          "Partial marking is applicable and will be awarded in direct proportion to the number of correct options selected, provided no incorrect option is selected.",
          "Selection of any incorrect option shall result in the response being treated as entirely incorrect, and negative marking shall be applied as per the prescribed marking scheme, irrespective of correct options selected.",
        ],
      },
    ],
  },
  confidence: {
    title: "Confidence-Weighted MCQs",
    blocks: [
      { type: "text", text: "For every question, you must:" },
      {
        type: "list",
        items: [
          "Select one answer option",
          "Select one confidence level: High, Average, or Low",
          "Selecting a confidence level is mandatory for every question",
        ],
      },
      { type: "text", text: "Marking Scheme" },
      { type: "text", text: "If your answer is correct:" },
      {
        type: "list",
        items: [
          "High Confidence -> +2 marks",
          "Average Confidence -> +1 mark",
          "Low Confidence -> +0.5 mark",
        ],
      },
      { type: "text", text: "If your answer is incorrect:" },
      {
        type: "list",
        items: [
          "High Confidence -> -1 mark",
          "Average Confidence -> -0.5 mark",
          "Low Confidence -> -0.1 mark",
        ],
      },
    ],
  },
  branch_parent: {
    title: "Decision Tree MCQs - Instructions",
    blocks: [
      {
        type: "list",
        items: [
          "This section begins with a Question X, which is not evaluated and carries no marks.",
          "Your response to Question X will determine the set of 5 MCQs that will appear next.",
          "Once an option is selected for Question X, it cannot be changed.",
          "Each of the 5 MCQs has only one correct answer.",
          "Carries +2 marks for a correct answer.",
          "Carries -0.5 marks for an incorrect answer.",
          "You may answer or skip any of these questions, similar to conventional MCQs.",
          "Marks are awarded or deducted only for attempted questions.",
        ],
      },
    ],
  },
  branch_child: {
    title: "Decision Tree MCQs - Instructions",
    blocks: [
      {
        type: "list",
        items: [
          "This section begins with a Question X, which is not evaluated and carries no marks.",
          "Your response to Question X will determine the set of 5 MCQs that will appear next.",
          "Once an option is selected for Question X, it cannot be changed.",
          "Each of the 5 MCQs has only one correct answer.",
          "Carries +2 marks for a correct answer.",
          "Carries -0.5 marks for an incorrect answer.",
          "You may answer or skip any of these questions, similar to conventional MCQs.",
          "Marks are awarded or deducted only for attempted questions.",
        ],
      },
    ],
  },
};

export default function Exam() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [studentId, setStudentId] = useState("");
  const [examCode, setExamCode] = useState("");
  const [pendingExamCode, setPendingExamCode] = useState("");
  const [mockTestCode, setMockTestCode] = useState("");
  const [introAccepted, setIntroAccepted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [examList, setExamList] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState("");
  const [examRefreshing, setExamRefreshing] = useState(false);
  const fetchingRef = useRef(false);
  const cancelledRef = useRef(false);
  const activeQuestionRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [time, setTime] = useState(new Date());
  const [hoveredOption, setHoveredOption] = useState(null);
  const [examDurationSeconds, setExamDurationSeconds] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [examStartAt, setExamStartAt] = useState(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const location = useLocation();
  const examCodeKey = String(examCode || "").trim();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const urlExamCode = String(searchParams.get("examCode") || "").trim();
  const urlMockTestCode = String(searchParams.get("mockTestCode") || "").trim();
  const mockTestCodeKey = String(mockTestCode || "").trim();
  const persistedMockTestCode = String(
    typeof window !== "undefined"
      ? localStorage.getItem("examMockTestCode") || ""
      : "",
  ).trim();
  const activeMockTestCode =
    mockTestCodeKey || urlMockTestCode || persistedMockTestCode;
  const examStoreKey = getExamStoreKey(examCodeKey, activeMockTestCode);
  const cachedEntry = useSelector(
    (state) => state.exam.questionsByExam[examStoreKey],
  );

  const clearExamStart = () => {
    localStorage.removeItem("examStartAt");
    localStorage.removeItem("examStartExamCode");
    localStorage.removeItem("examStartMockTestCode");
  };

  const clearMockSelection = () => {
    localStorage.removeItem("examMockTestCode");
    setMockTestCode("");
  };

  const fetchExamList = useCallback(async (options = {}) => {
    const silent = options.silent === true;
    const forceRefresh = options.forceRefresh === true;

    if (fetchingRef.current || cancelledRef.current) return;
    fetchingRef.current = true;

    const currentStudentIdentifier = String(
      localStorage.getItem("examStudentId") ||
      localStorage.getItem("studentRoll") ||
      localStorage.getItem("studentId") ||
      ""
    ).trim();
    const examCacheKey = getExamCacheKey(currentStudentIdentifier);

    const cachedNow = readExamListCache(examCacheKey, { allowStale: true });
    const hasCacheNow =
      Array.isArray(cachedNow?.data) && cachedNow.data.length > 0;

    if (forceRefresh) setExamRefreshing(true);
    if (!silent && !hasCacheNow) setExamLoading(true);
    if (!silent && !forceRefresh) setExamError("");

    try {
      const { data } = await examApi.list({
        retries: 2,
        retryDelayMs: 1500,
        params: {
          ...(forceRefresh ? { refresh: 1 } : {}),
          ...(currentStudentIdentifier ? { studentId: currentStudentIdentifier } : {}),
        },
      });
      if (cancelledRef.current) return;
      if (data.success) {
        const list = data.data || [];
        setExamList(list);
        writeExamListCache(examCacheKey, list);
      } else if (!silent && !hasCacheNow) {
        setExamError(data.message || "Failed to load exams");
      }
    } catch (e) {
      if (!cancelledRef.current && !silent && !hasCacheNow) {
        setExamError(e.response?.data?.message || "Failed to load exams");
      }
    } finally {
      if (!cancelledRef.current) {
        if (!silent && !hasCacheNow) setExamLoading(false);
        if (forceRefresh) setExamRefreshing(false);
      }
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const saved =
      localStorage.getItem("examStudentId") ||
      localStorage.getItem("studentId");
    if (saved) setStudentId(saved);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (urlExamCode) {
      localStorage.setItem("examCode", urlExamCode);
      if (!examCode && !pendingExamCode) {
        setPendingExamCode(urlExamCode);
      }
    }

    if (urlMockTestCode) {
      localStorage.setItem("examMockTestCode", urlMockTestCode);
      setMockTestCode(urlMockTestCode);
    } else if (searchParams.has("mockTestCode")) {
      clearMockSelection();
    }
  }, [urlExamCode, urlMockTestCode, examCode, pendingExamCode, searchParams]);

  useEffect(() => {
    if (activeMockTestCode && activeMockTestCode !== mockTestCodeKey) {
      setMockTestCode(activeMockTestCode);
    }
  }, [activeMockTestCode, mockTestCodeKey]);

  useEffect(() => {
    if (pendingExamCode || examCode) return;
    const storedExam = localStorage.getItem("examCode");
    if (storedExam) setPendingExamCode(storedExam);
    const storedMock = localStorage.getItem("examMockTestCode");
    if (storedMock) setMockTestCode(String(storedMock || "").trim());
  }, [pendingExamCode, examCode]);

  useEffect(() => {
    if (!examCode) return;
    const storedStart = localStorage.getItem("examStartAt");
    const storedCode = localStorage.getItem("examStartExamCode");
    const storedMock = localStorage.getItem("examStartMockTestCode") || "";
    if (
      examStartAt &&
      storedCode === examCode &&
      String(storedMock || "") === activeMockTestCode
    ) {
      return;
    }
    if (
      storedStart &&
      storedCode === examCode &&
      String(storedMock || "") === activeMockTestCode
    ) {
      const parsed = new Date(storedStart);
      if (!Number.isNaN(parsed.getTime())) {
        setExamStartAt(parsed);
        return;
      }
    }
    const now = new Date();
    localStorage.setItem("examStartAt", now.toISOString());
    localStorage.setItem("examStartExamCode", examCode);
    localStorage.setItem("examStartMockTestCode", activeMockTestCode);
    setExamStartAt(now);
  }, [examCode, examStartAt, activeMockTestCode]);

  useEffect(() => {
    if (examCode) return;
    cancelledRef.current = false;
    const currentStudentIdentifier = String(
      localStorage.getItem("examStudentId") ||
      localStorage.getItem("studentRoll") ||
      localStorage.getItem("studentId") ||
      ""
    ).trim();
    const examCacheKey = getExamCacheKey(currentStudentIdentifier);

    const cachedFresh = readExamListCache(examCacheKey);
    const cachedStale = cachedFresh
      ? null
      : readExamListCache(examCacheKey, { allowStale: true });
    const activeCache = cachedFresh || cachedStale;
    const hasCache =
      Array.isArray(activeCache?.data) && activeCache.data.length > 0;
    if (hasCache) setExamList(activeCache.data);
    setExamLoading(!hasCache);
    setExamError("");

    if (!hasCache) {
      fetchExamList({ silent: false });
    } else if (activeCache?.isStale) {
      fetchExamList({ silent: true });
    }

    return () => {
      cancelledRef.current = true;
    };
  }, [examCode, fetchExamList]);

  const handleManualRefresh = () => {
    setExamError("");
    fetchExamList({ silent: true, forceRefresh: true });
  };

  useEffect(() => {
    let cancelled = false;

    if (!examCode) {
      setQuestions([]);
      setLoading(false);
      setExamDurationSeconds(null);
      setTimeLeft(null);
      setExamStartAt(null);
      setAutoSubmitted(false);
      return () => {
        cancelled = true;
      };
    }

    const reduxEntry =
      cachedEntry && Array.isArray(cachedEntry.questions) ? cachedEntry : null;
    const reduxAgeMs = reduxEntry
      ? Date.now() - (Number(reduxEntry.fetchedAt) || 0)
      : Number.POSITIVE_INFINITY;
    const reduxIsFresh = reduxEntry && reduxAgeMs < EXAM_QUESTIONS_CACHE_TTL_MS;

    let usedCache = false;
    let cacheIsStale = false;
    let cachedQuestions = [];
    let cachedExam = null;
    let cachedTs = null;

    if (reduxEntry && reduxEntry.questions.length > 0) {
      cachedQuestions = reduxEntry.questions;
      cachedExam = reduxEntry.exam || null;
      cachedTs = Number(reduxEntry.fetchedAt) || null;
      usedCache = true;
      cacheIsStale = !reduxIsFresh;
    }

    if (!usedCache) {
      const cached = readQuestionsCache(examCodeKey, {
        allowStale: true,
        mockTestCode: activeMockTestCode,
      });
      cachedQuestions = Array.isArray(cached?.data?.questions)
        ? cached.data.questions
        : [];
      cachedExam = cached?.data?.exam || null;
      cachedTs = cached?.ts || null;
      if (cachedQuestions.length > 0) {
        usedCache = true;
        cacheIsStale = !!cached?.isStale;
        dispatch(
          setExamQuestions({
            examCode: examStoreKey,
            exam: cachedExam,
            questions: cachedQuestions,
            fetchedAt: cachedTs,
          }),
        );
      }
    }

    if (activeMockTestCode && cachedQuestions.length > 0) {
      cachedQuestions = cachedQuestions.filter(
        (q) => String(q?.mockTestCode || "").trim() === activeMockTestCode,
      );
    }

    if (cachedQuestions.length > 0) {
      setQuestions(cachedQuestions);
      const durationMinutes = cachedExam?.durationMinutes || 60;
      setExamDurationSeconds(durationMinutes * 60);
      setLoading(false);
    } else {
      setQuestions([]);
      setLoading(true);
    }
    setError("");
    setAnswers({});
    setCurrent(0);
    setSubmitSuccess(null);
    setAutoSubmitted(false);

    const shouldFetch =
      !usedCache || cacheIsStale || cachedQuestions.length === 0;

    if (!shouldFetch) {
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const { data } = await questionApi.byExamCode(
          examCodeKey,
          activeMockTestCode ? { mockTestCode: activeMockTestCode } : undefined,
        );
        const durationMinutes = data?.exam?.durationMinutes || 60;
        let list = data?.questions || data?.data || [];
        if (activeMockTestCode) {
          list = list.filter(
            (q) => String(q?.mockTestCode || "").trim() === activeMockTestCode,
          );
        }
        if (!cancelled) {
          setExamDurationSeconds(durationMinutes * 60);
          setQuestions(list);
          writeQuestionsCache(
            examCodeKey,
            {
              exam: {
                examCode: examCodeKey,
                title: data?.exam?.title || examCodeKey,
                durationMinutes,
              },
              questions: list,
            },
            { mockTestCode: activeMockTestCode },
          );
          dispatch(
            setExamQuestions({
              examCode: examStoreKey,
              exam: {
                examCode: examCodeKey,
                title: data?.exam?.title || examCodeKey,
                durationMinutes,
              },
              questions: list,
              fetchedAt: Date.now(),
            }),
          );
          if (!list.length) {
            setError("No questions found for this exam.");
          }
        }
      } catch (e) {
        if (!cancelled && cachedQuestions.length === 0) {
          setError(e.response?.data?.message || "Could not load questions");
        }
      } finally {
        if (!cancelled && cachedQuestions.length === 0) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [examCode, activeMockTestCode, examStoreKey]);

  useEffect(() => {
    if (!examStartAt || examDurationSeconds === null) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - examStartAt.getTime()) / 1000);
      const remaining = Math.max(examDurationSeconds - elapsed, 0);
      setTimeLeft(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [examStartAt, examDurationSeconds]);

  const formatTimeLeft = (sec) => {
    const safe = Math.max(0, Number.isFinite(sec) ? sec : 0);
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleString();
  };

  const formatDateOnly = (value) => {
    if (!value) return "-";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString();
  };

  const toggleExamSection = (examCodeValue, section) => {
    const key = `${String(examCodeValue || "").trim()}::${section}`;
    if (!key) return;
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const visibleQuestions = useMemo(() => {
    if (!questions.length) return [];
    return questions.filter((question) => {
      if (question.type !== "branch_child") return true;
      const parentAns =
        answers[`branch_parent_main_${question.parentQuestion}`];
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
  const aid = q
    ? answers[`${q.type}_${q.branchKey || "main"}_${q.questionNumber}`] || {}
    : {};
  const branchMustSelect = q?.type === "branch_parent" && !aid?.selectedAnswer;
  const branchLocked = q?.type === "branch_parent" && !!aid?.selectedAnswer;

  useEffect(() => {
    const currentQ = q;
    const prevQ = activeQuestionRef.current;
    if (
      prevQ &&
      (!currentQ ||
        prevQ.type !== currentQ.type ||
        (prevQ.branchKey || "main") !== (currentQ.branchKey || "main") ||
        prevQ.questionNumber !== currentQ.questionNumber)
    ) {
      endVisit(prevQ);
    }
    if (currentQ) {
      startVisit(currentQ);
    }
    activeQuestionRef.current = currentQ || null;
  }, [q]);

  // Auto-clear confidence-specific error after a short delay
  useEffect(() => {
    if (error !== CONFIDENCE_REQUIRED_ERROR) return;
    const timer = setTimeout(() => {
      setError((prev) => (prev === CONFIDENCE_REQUIRED_ERROR ? "" : prev));
    }, 5000);
    return () => clearTimeout(timer);
  }, [error, q?.questionNumber]);

  const scoredQuestions = useMemo(
    () =>
      visibleQuestions.filter(
        (vq) => vq.type !== "branch_parent" && vq.type !== "x_option",
      ),
    [visibleQuestions],
  );
  const displayIndexMap = useMemo(() => {
    const map = new Map();
    let counter = 1;
    visibleQuestions.forEach((vq) => {
      const key = `${vq.type}_${vq.branchKey || "main"}_${vq.questionNumber}`;
      if (vq.type === "branch_parent") {
        map.set(key, "X");
      } else if (vq.type === "x_option") {
        map.set(key, "Info");
      } else {
        map.set(key, counter++);
      }
    });
    return map;
  }, [visibleQuestions]);
  const totalsByType = useMemo(() => {
    const counts = {
      simple: 0,
      multiple: 0,
      confidence: 0,
      x_option: 0,
      branch_a: 0,
      branch_b: 0,
    };
    questions.forEach((q) => {
      const t = q.type;
      if (t === "simple") counts.simple++;
      else if (t === "multiple") counts.multiple++;
      else if (t === "confidence") counts.confidence++;
      else if (t === "x_option") counts.x_option++;
      else if (t === "branch_child") {
        if (q.branchKey === "A") counts.branch_a++;
        else if (q.branchKey === "B") counts.branch_b++;
      }
    });
    return counts;
  }, [questions]);
  const displayTotalValue = useMemo(() => {
    const { simple, multiple, confidence, branch_a, branch_b } = totalsByType;
    const parentQ = questions.find((q) => q.type === "branch_parent");
    const parentAns = parentQ
      ? answers[
          `${parentQ.type}_${parentQ.branchKey || "main"}_${parentQ.questionNumber}`
        ]
      : null;
    const sBranch = parentAns?.selectedAnswer;
    const bCount =
      sBranch === "A"
        ? branch_a
        : sBranch === "B"
          ? branch_b
          : Math.max(branch_a, branch_b);
    return simple + multiple + confidence + bCount;
  }, [totalsByType, questions, answers]);
  const displayTotal = displayTotalValue;
  const dKey = `${q?.type}_${q?.branchKey || "main"}_${q?.questionNumber}`;
  const displayIndex =
    displayIndexMap.get(dKey) === "X" ? "X" : displayIndexMap.get(dKey) || "-";

  const attemptedCount = scoredQuestions.filter(
    (vq) =>
      answers[`${vq.type}_${vq.branchKey || "main"}_${vq.questionNumber}`]
        ?.status === "attempted",
  ).length;
  const skippedCount = scoredQuestions.filter(
    (vq) =>
      answers[`${vq.type}_${vq.branchKey || "main"}_${vq.questionNumber}`]
        ?.status === "skipped",
  ).length;
  const pendingCount = displayTotal - attemptedCount - skippedCount;

  const navItems = useMemo(
    () =>
      visibleQuestions.map((vq, i) => {
        const key = `${vq.type}_${vq.branchKey || "main"}_${vq.questionNumber}`;
        const val = displayIndexMap.get(key);
        return {
          q: vq,
          visibleIdx: i,
          label: val === "Info" ? "I" : val,
        };
      }),
    [visibleQuestions, displayIndexMap],
  );

  const updateAnswer = (question, updater) => {
    const { type, branchKey, questionNumber } = question;
    const key = `${type}_${branchKey || "main"}_${questionNumber}`;
    setAnswers((prev) => {
      const prevAns = prev[key] || {};
      const next =
        typeof updater === "function"
          ? updater(prevAns)
          : { ...prevAns, ...updater };
      return { ...prev, [key]: next };
    });
  };

  const formatHistoryLabel = (
    questionType,
    selectedAnswer,
    selectedAnswers,
  ) => {
    if (questionType === "multiple") {
      const list = Array.isArray(selectedAnswers) ? selectedAnswers : [];
      return list.length ? list.join(",") : "-";
    }
    return selectedAnswer || "-";
  };

  const updateTrackingOnChange = (prevTracking, meta) => {
    const now = Date.now();
    const tracking = { ...(prevTracking || {}) };
    const visitDurationsMs = Array.isArray(tracking.visitDurationsMs)
      ? tracking.visitDurationsMs
      : [];
    const visitIndex = visitDurationsMs.length + 1;

    if (!tracking.currentVisitStartedAt) {
      tracking.currentVisitStartedAt = now;
      tracking.currentVisitFirstChangeMs = null;
    }

    const changeMs = Math.max(0, now - tracking.currentVisitStartedAt);
    if (
      tracking.currentVisitFirstChangeMs === null ||
      tracking.currentVisitFirstChangeMs === undefined
    ) {
      tracking.currentVisitFirstChangeMs = changeMs;
      if (
        visitIndex === 1 &&
        (tracking.firstVisitMs === null || tracking.firstVisitMs === undefined)
      ) {
        tracking.firstVisitMs = changeMs;
      }
      if (visitIndex > 1) {
        const revisit = Array.isArray(tracking.revisitChangeMs)
          ? tracking.revisitChangeMs
          : [];
        tracking.revisitChangeMs = [...revisit, changeMs];
      }
    }

    const label = formatHistoryLabel(
      meta.questionType,
      meta.selectedAnswer || null,
      meta.selectedAnswers || [],
    );
    const history = Array.isArray(tracking.answerHistory)
      ? tracking.answerHistory
      : [];
    tracking.answerHistory = [...history, label];
    const prevCount = Number.isFinite(tracking.answerChangeCount)
      ? tracking.answerChangeCount
      : history.length;
    tracking.answerChangeCount = prevCount + 1;
    return tracking;
  };

  const startVisit = (question) => {
    const now = Date.now();
    updateAnswer(question, (prevAns) => {
      const tracking = prevAns.tracking || {};
      if (tracking.currentVisitStartedAt) return prevAns;
      return {
        ...prevAns,
        tracking: {
          ...tracking,
          currentVisitStartedAt: now,
          currentVisitFirstChangeMs: null,
        },
      };
    });
  };

  const endVisit = (question, endAt = Date.now()) => {
    updateAnswer(question, (prevAns) => {
      const tracking = prevAns.tracking || {};
      if (!tracking.currentVisitStartedAt) return prevAns;
      const durationMs = Math.max(0, endAt - tracking.currentVisitStartedAt);
      const visitDurationsMs = Array.isArray(tracking.visitDurationsMs)
        ? [...tracking.visitDurationsMs, durationMs]
        : [durationMs];
      const totalTimeMs = (Number(tracking.totalTimeMs) || 0) + durationMs;
      return {
        ...prevAns,
        tracking: {
          ...tracking,
          visitDurationsMs,
          totalTimeMs,
          currentVisitStartedAt: null,
          currentVisitFirstChangeMs: null,
        },
      };
    });
  };

  const markSingleAttempted = (opt) => {
    if (!q) return;
    updateAnswer(q, (prevAns) => {
      if (q.type === "branch_parent" && prevAns.selectedAnswer) return prevAns;
      const nextTracking = updateTrackingOnChange(prevAns.tracking, {
        questionType: q.type,
        selectedAnswer: opt,
        selectedAnswers: [],
      });
      return {
        ...prevAns,
        status: "attempted",
        selectedAnswer: opt,
        selectedAnswers: [],
        confidence: q.type === "confidence" ? prevAns.confidence : null,
        tracking: nextTracking,
      };
    });
  };

  const toggleMultipleAttempt = (opt) => {
    if (!q) return;
    updateAnswer(q, (prevAns) => {
      const prevSelected = prevAns.selectedAnswers || [];
      const exists = prevSelected.includes(opt);
      const updated = exists
        ? prevSelected.filter((k) => k !== opt)
        : [...prevSelected, opt];
      const nextTracking = updateTrackingOnChange(prevAns.tracking, {
        questionType: q.type,
        selectedAnswer: null,
        selectedAnswers: updated,
      });
      return {
        ...prevAns,
        selectedAnswer: null,
        selectedAnswers: updated,
        status: updated.length ? "attempted" : "not_visited",
        tracking: nextTracking,
      };
    });
  };

  const markSkipped = () => {
    if (!q || q.type === "branch_parent") return;
    updateAnswer(q, (prevAns) => {
      const hadSelection =
        !!prevAns.selectedAnswer ||
        (Array.isArray(prevAns.selectedAnswers) &&
          prevAns.selectedAnswers.length > 0);
      const nextTracking = hadSelection
        ? updateTrackingOnChange(prevAns.tracking, {
            questionType: q.type,
            selectedAnswer: null,
            selectedAnswers: [],
          })
        : prevAns.tracking;
      return {
        ...prevAns,
        status: "skipped",
        selectedAnswer: null,
        selectedAnswers: [],
        confidence: null,
        tracking: nextTracking,
      };
    });
  };

  const handleConfidenceChange = (level) => {
    if (!q) return;
    updateAnswer(q, { confidence: level });
  };

  const hasSelectionFor = (question, answer) => {
    if (!question) return false;
    if (question.type === "multiple") {
      return (answer?.selectedAnswers || []).length > 0;
    }
    return !!answer?.selectedAnswer;
  };

  const finalizeAnswersForSubmit = (snapshotAnswers, activeKey, endTimeMs) => {
    if (!activeKey) {
      return snapshotAnswers;
    }
    const currentAns = snapshotAnswers[activeKey];
    if (!currentAns?.tracking?.currentVisitStartedAt) return snapshotAnswers;
    const tracking = currentAns.tracking || {};
    const durationMs = Math.max(0, endTimeMs - tracking.currentVisitStartedAt);
    const visitDurationsMs = Array.isArray(tracking.visitDurationsMs)
      ? [...tracking.visitDurationsMs, durationMs]
      : [durationMs];
    const totalTimeMs = (Number(tracking.totalTimeMs) || 0) + durationMs;

    return {
      ...snapshotAnswers,
      [activeKey]: {
        ...currentAns,
        tracking: {
          ...tracking,
          visitDurationsMs,
          totalTimeMs,
          currentVisitStartedAt: null,
          currentVisitFirstChangeMs: null,
        },
      },
    };
  };

  const handleSkipAndNext = () => {
    if (!q || q.type === "branch_parent") return;
    if (aid?.status !== "skipped") {
      markSkipped();
    }
    if (current < visibleQuestions.length - 1) {
      setCurrent((c) => c + 1);
    }
  };
  const handleNext = () => {
    if (!q || branchMustSelect) return;
    const hasSelection = hasSelectionFor(q, aid);

    // For confidence questions: if answer selected but confidence not chosen, block Next
    if (q.type === "confidence" && hasSelection && !aid?.confidence) {
      setError(CONFIDENCE_REQUIRED_ERROR);
      return;
    }

    if (
      !hasSelection &&
      aid?.status !== "skipped" &&
      q.type !== "branch_parent"
    ) {
      markSkipped();
    }
    if (current < visibleQuestions.length - 1) {
      setCurrent((c) => c + 1);
    }
  };

  const handleSubmit = async (auto = false) => {
    if (!examCode.trim()) {
      setError("Exam not selected. Please choose from dashboard.");
      return;
    }
    setError("");
    setSubmitLoading(true);
    try {
      const endTime = new Date();
      const finalizedAnswers = finalizeAnswersForSubmit(
        answers,
        `${q.type}_${q.branchKey || "main"}_${q.questionNumber}`,
        endTime.getTime(),
      );
      const startedAtIso = examStartAt ? examStartAt.toISOString() : null;
      const timeTakenSeconds = examStartAt
        ? Math.max(
            0,
            Math.floor((endTime.getTime() - examStartAt.getTime()) / 1000),
          )
        : null;
      const payload = questions.map((question) => {
        const key = `${question.type}_${question.branchKey || "main"}_${question.questionNumber}`;
        const a = finalizedAnswers[key] || {};
        let selectedAnswer = a.selectedAnswer || null;
        let selectedAnswers = a.selectedAnswers || [];

        const branchAllowed =
          question.type !== "branch_child" ||
          finalizedAnswers[`branch_parent_main_${question.parentQuestion}`]
            ?.selectedAnswer === question.branchKey;

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

        const tracking = a.tracking || {};
        const firstVisitMs =
          Number.isFinite(Number(tracking.firstVisitMs)) &&
          Number(tracking.firstVisitMs) >= 0
            ? Math.round(Number(tracking.firstVisitMs))
            : null;
        const visitDurationsMs = Array.isArray(tracking.visitDurationsMs)
          ? tracking.visitDurationsMs
              .map((v) =>
                Number.isFinite(Number(v)) ? Math.round(Number(v)) : null,
              )
              .filter((v) => v !== null)
          : [];
        const revisitChangeMs = Array.isArray(tracking.revisitChangeMs)
          ? tracking.revisitChangeMs
              .map((v) =>
                Number.isFinite(Number(v)) ? Math.round(Number(v)) : null,
              )
              .filter((v) => v !== null)
          : [];
        const totalTimeMs = visitDurationsMs.length
          ? visitDurationsMs.reduce((sum, v) => sum + v, 0)
          : Number.isFinite(Number(tracking.totalTimeMs)) &&
              Number(tracking.totalTimeMs) >= 0
            ? Math.round(Number(tracking.totalTimeMs))
            : null;
        const answerHistory = Array.isArray(tracking.answerHistory)
          ? tracking.answerHistory
              .map((v) => String(v || "").trim())
              .filter((v) => v)
          : [];
        const answerChangeCount = Number.isFinite(
          Number(tracking.answerChangeCount),
        )
          ? Math.max(0, Math.floor(Number(tracking.answerChangeCount)))
          : answerHistory.length;

        return {
          questionNumber: question.questionNumber,
          type: question.type,
          selectedAnswer,
          selectedAnswers,
          confidence: a.confidence || null,
          status,
          firstVisitMs,
          revisitChangeMs,
          visitDurationsMs,
          totalTimeMs,
          answerHistory,
          answerChangeCount,
        };
      });

      const resolvedMockTestCode =
        activeMockTestCode ||
        String(localStorage.getItem("examMockTestCode") || "").trim();
      const submitBody = {
        examCode: examCode.trim(),
        attempts: payload,
        autoSubmitted: !!auto,
        startedAt: startedAtIso,
        endedAt: endTime.toISOString(),
        durationSeconds: examDurationSeconds || null,
        timeTakenSeconds,
      };
      if (resolvedMockTestCode) {
        submitBody.mockTestCode = resolvedMockTestCode;
      }
      if (studentId.trim()) {
        submitBody.studentId = studentId.trim();
      }

      const { data } = resolvedMockTestCode
        ? await olympiadExamApi.submitMock(submitBody)
        : await examApi.submit(submitBody);

      if (data.success) {
        setSubmitSuccess({ attemptId: data.attemptId, result: data });
        clearExamStart();
        clearMockSelection();
        setExamStartAt(null);
        setTimeLeft(null);
        setExamDurationSeconds(null);
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

  useEffect(() => {
    if (timeLeft !== 0) return;
    if (loading || !questions.length) return;
    if (autoSubmitted || submitLoading) return;
    setAutoSubmitted(true);
    handleSubmit(true);
  }, [
    timeLeft,
    loading,
    questions.length,
    autoSubmitted,
    submitLoading,
    handleSubmit,
  ]);

  if (!examCode) {
    if (pendingExamCode) {
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
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Question Types - Instructions
                </h3>
                <p className="text-gray-600 text-sm">
                  Read all sets carefully before starting the exam.
                </p>
              </div>

              <div className="mb-4 text-center text-xs text-gray-600">
                Conventional MCQs | Multiple correct answers MCQs |
                Confidence-Weighted MCQs | Decision Tree MCQs
              </div>

              <div className="grid gap-4 md:grid-cols-2 text-left">
                <div className="rounded-2xl border border-[#FFE1B5] bg-white/95 p-4 shadow-sm">
                  <div className="text-[11px] uppercase tracking-wide text-amber-700/80">
                    Section 1
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Conventional MCQs
                  </h4>
                  <ul className="text-xs text-gray-700 list-disc list-inside space-y-1">
                    <li>
                      Every question will have only one correct option as
                      answer.
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#FFE1B5] bg-white/95 p-4 shadow-sm">
                  <div className="text-[11px] uppercase tracking-wide text-amber-700/80">
                    Section 2
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Multiple Correct Answers MCQs
                  </h4>
                  <ul className="text-xs text-gray-700 list-disc list-inside space-y-1">
                    <li>
                      Questions may have one or more correct options, up to all
                      four.
                    </li>
                    <li>Candidates must select all correct options.</li>
                    <li>
                      Partial marking is applicable if no incorrect option is
                      selected.
                    </li>
                    <li>
                      Any incorrect option makes the response incorrect and
                      negative marking applies.
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#FFE1B5] bg-white/95 p-4 shadow-sm">
                  <div className="text-[11px] uppercase tracking-wide text-amber-700/80">
                    Section 3
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Confidence-Weighted MCQs
                  </h4>
                  <ul className="text-xs text-gray-700 list-disc list-inside space-y-1">
                    <li>Select one answer option for every question.</li>
                    <li>Select one confidence level: High, Average, or Low.</li>
                    <li>
                      Confidence selection is mandatory for every question.
                    </li>
                    <li>Correct: High +2, Average +1, Low +0.5.</li>
                    <li>Incorrect: High -1, Average -0.5, Low -0.1.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#FFE1B5] bg-white/95 p-4 shadow-sm">
                  <div className="text-[11px] uppercase tracking-wide text-amber-700/80">
                    Section 4
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Decision Tree MCQs - Instructions
                  </h4>
                  <ul className="text-xs text-gray-700 list-disc list-inside space-y-1">
                    <li>Starts with Question X (no marks).</li>
                    <li>Question X decides the next set of 5 MCQs.</li>
                    <li>Once selected, Question X cannot be changed.</li>
                    <li>Each of the 5 MCQs has one correct answer.</li>
                    <li>
                      Correct answer: +2 marks. Incorrect answer: -0.5 marks.
                    </li>
                    <li>
                      You may answer or skip these questions like conventional
                      MCQs.
                    </li>
                    <li>Marks apply only to attempted questions.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[#FFE6A3] bg-white/90 p-4 shadow-sm">
                <label className="flex items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={introAccepted}
                    onChange={(e) => setIntroAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#FFCD2C]"
                  />
                  <span>
                    I have read and understood all the instructions carefully. I
                    am ready to take the exam now.
                  </span>
                </label>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    const now = new Date();
                    const resolvedMockTestCode =
                      activeMockTestCode ||
                      String(
                        localStorage.getItem("examMockTestCode") || "",
                      ).trim();
                    localStorage.setItem("examCode", pendingExamCode);
                    localStorage.setItem("examStartAt", now.toISOString());
                    localStorage.setItem("examStartExamCode", pendingExamCode);
                    if (resolvedMockTestCode) {
                      localStorage.setItem(
                        "examMockTestCode",
                        resolvedMockTestCode,
                      );
                      localStorage.setItem(
                        "examStartMockTestCode",
                        resolvedMockTestCode,
                      );
                      setMockTestCode(resolvedMockTestCode);
                    } else {
                      clearMockSelection();
                      localStorage.removeItem("examStartMockTestCode");
                    }
                    setExamStartAt(now);
                    setExamCode(pendingExamCode);
                    setPendingExamCode("");
                    setIntroAccepted(false);
                  }}
                  disabled={!introAccepted}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    introAccepted
                      ? "bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 hover:shadow-lg"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Start Exam
                </button>
                <button
                  onClick={() => {
                    setPendingExamCode("");
                    setIntroAccepted(false);
                    localStorage.removeItem("examCode");
                    clearExamStart();
                    clearMockSelection();
                    setExamStartAt(null);
                  }}
                  className="px-6 py-3 rounded-lg border border-[#FFE6A3] bg-white text-gray-800 hover:bg-[#FFF3C4] transition"
                >
                  Change Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

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
              <p className="text-gray-600 text-sm">Pick an exam to start.</p>
              <div className="mt-3 flex items-center justify-center">
                <button
                  onClick={handleManualRefresh}
                  disabled={examRefreshing}
                  className={`text-[11px] px-3 py-1.5 rounded-full border border-[#FFD765] text-amber-800 bg-[#FFF9E6] hover:bg-[#FFEBB5] transition ${
                    examRefreshing ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {examRefreshing ? "Refreshing..." : "Refresh Exams"}
                </button>
              </div>
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
                examList.map((exam) => {
                  const isStudentPaid = !!exam?.isStudentPaid;
                  const canStartExam = !!exam?.canStartExam;
                  const paymentAmount = Number(exam?.payment?.amount) || 0;
                  const paymentDate = exam?.payment?.paidAt || null;
                  const startReason = !isStudentPaid
                    ? "Payment required"
                    : !exam?.isPaymentValidityActive
                      ? "10-day validity expired"
                      : !exam?.isExamWindowActive
                        ? "Exam time window inactive"
                        : "";

                  return (
                    <div
                      key={exam.examCode}
                      className="group relative overflow-hidden rounded-2xl border border-[#FFE1B5] bg-white/95 shadow-sm hover:shadow-md transition"
                    >
                      <div className="absolute inset-0 pointer-events-none opacity-40 bg-gradient-to-br from-[#FFF3C4]/60 via-transparent to-[#FFE0D9]/70" />
                      <div className="relative p-3 flex flex-col gap-2">
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

                        <div className="text-[11px] text-gray-600 leading-tight">
                          Total Questions:{" "}
                          <span className="font-medium text-gray-900">
                            {exam.totalQuestions || 0}
                          </span>
                        </div>

                        <div className="flex items-center flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => toggleExamSection(exam.examCode, "payment")}
                            className="text-[11px] px-3 py-2 rounded-full border border-[#FFE6A3] text-gray-800 bg-[#FFFDF5] hover:bg-[#FFF3C4] transition"
                          >
                            Paid Details {expandedSections[`${exam.examCode}::payment`] ? "- Hide" : "- Show"}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleExamSection(exam.examCode, "time")}
                            className="text-[11px] px-3 py-2 rounded-full border border-[#FFE6A3] text-gray-800 bg-[#FFFDF5] hover:bg-[#FFF3C4] transition"
                          >
                            Exam Time {expandedSections[`${exam.examCode}::time`] ? "- Hide" : "- Show"}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleExamSection(exam.examCode, "validity")}
                            className="text-[11px] px-3 py-2 rounded-full border border-[#FFE6A3] text-gray-800 bg-[#FFFDF5] hover:bg-[#FFF3C4] transition"
                          >
                            Exam Validity {expandedSections[`${exam.examCode}::validity`] ? "- Hide" : "- Show"}
                          </button>
                        </div>

                        {expandedSections[`${exam.examCode}::payment`] ? (
                          <div className="rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2 text-[11px] text-gray-700">
                            <div>Status: {isStudentPaid ? "Paid" : "Not Paid"}</div>
                            <div>Amount: {isStudentPaid ? `₹${paymentAmount}` : "-"}</div>
                            <div>Paid At: {formatDateTime(paymentDate)}</div>
                          </div>
                        ) : null}

                        {expandedSections[`${exam.examCode}::time`] ? (
                          <div className="rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2 text-[11px] text-gray-700">
                            <div>Start: {formatDateTime(exam.examStartAt)}</div>
                            <div>End: {formatDateTime(exam.examEndAt)}</div>
                          </div>
                        ) : null}

                        <div className="text-[11px] text-gray-700">
                          Total Students Registered & Paid:{" "}
                          <span className="font-semibold text-gray-900">
                            {Number(exam.totalRegisteredPaidStudents) || 0}
                          </span>
                        </div>

                        {expandedSections[`${exam.examCode}::validity`] ? (
                          <div className="rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2 text-[11px] text-gray-700">
                            <div>
                              Available From: {formatDateOnly(exam.paymentAvailableFrom)}
                            </div>
                            <div>
                              Valid Till: {formatDateOnly(exam.paymentValidTill)}
                            </div>
                          </div>
                        ) : null}

                        {startReason ? (
                          <div className="text-[10px] text-rose-700">
                            Start Exam disabled: {startReason}
                          </div>
                        ) : null}

                        <button
                          onClick={() => {
                            if (!canStartExam) return;
                            setPendingExamCode(exam.examCode);
                            setIntroAccepted(false);
                            clearMockSelection();
                          }}
                          disabled={!canStartExam}
                          className={`mt-1 text-[11px] px-3 py-2 rounded-full font-semibold transition ${
                            canStartExam
                              ? "bg-[#FFCD2C] text-gray-900 hover:bg-[#FFC107]"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Start Exam
                        </button>
                      </div>
                    </div>
                  );
                })
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
              {mockTestCodeKey ? (
                <span className="ml-2 text-xs text-gray-500">
                  (Mock: {mockTestCodeKey})
                </span>
              ) : null}
            </p>
            <button
              onClick={() => {
                setError("");
                localStorage.removeItem("examCode");
                clearExamStart();
                clearMockSelection();
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
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-bold text-gray-900">
                      {q?.type === "branch_parent"
                        ? "Question X"
                        : q?.type === "x_option"
                          ? "Information"
                          : `Question ${q?.questionNumber}`}
                    </h2>
                    {timeLeft !== null && (
                      <div
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          timeLeft <= 60
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        Time Left: {formatTimeLeft(timeLeft)}
                      </div>
                    )}
                  </div>

                  {SECTION_INFO[q?.type] && (
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2">
                      <div className="text-[11px] font-semibold text-amber-800">
                        {SECTION_INFO[q?.type].title}
                      </div>
                      <div className="mt-1 space-y-1">
                        {SECTION_INFO[q?.type].blocks.map((block, idx) => {
                          if (block.type === "text") {
                            return (
                              <p
                                key={`t-${idx}`}
                                className="text-[11px] text-amber-800"
                              >
                                {block.text}
                              </p>
                            );
                          }
                          return (
                            <ul
                              key={`l-${idx}`}
                              className="text-[11px] text-amber-800 list-disc list-inside space-y-0.5"
                            >
                              {block.items.map((line) => (
                                <li key={line}>{line}</li>
                              ))}
                            </ul>
                          );
                        })}
                      </div>
                    </div>
                  )}

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
                          (o) => o.key === "A" || o.key === "B",
                        )
                      : q?.options || []
                    ).map((o) => {
                      const isMultiple = q?.type === "multiple";
                      const isSelected = isMultiple
                        ? (aid?.selectedAnswers || []).includes(o.key)
                        : aid?.selectedAnswer === o.key;
                      const isDisabled =
                        q?.type === "branch_parent" && branchLocked;

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
                                  isSelected
                                    ? "text-amber-800"
                                    : "text-gray-700"
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
                      Please choose A or B to continue. (Branch decision
                      required)
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
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Confidence Level
                        </h3>
                        {error === CONFIDENCE_REQUIRED_ERROR && (
                          <span className="text-[11px] text-red-600 font-medium">
                            Please choose a confidence option before moving
                            ahead.
                          </span>
                        )}
                      </div>
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
                      onClick={handleSkipAndNext}
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
                          onClick={handleNext}
                          disabled={branchMustSelect}
                          className={`px-4 py-2.5 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 font-medium rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${
                            branchMustSelect
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSubmit(false)}
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
                      const ansKey = `${navQ.type}_${navQ.branchKey || "main"}_${navQ.questionNumber}`;
                      const answer = answers[ansKey];
                      const isCurrent = current === visibleIdx;
                      const disableNav =
                        branchMustSelect && visibleIdx !== current;

                      let bgClass = "bg-gray-200 text-gray-700";
                      if (isCurrent)
                        bgClass = "bg-[#111827] text-white shadow-md";
                      else if (answer?.status === "attempted")
                        bgClass = "bg-emerald-600 text-white";
                      else if (answer?.status === "skipped")
                        bgClass = "bg-amber-500 text-white";

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
                      <div className="text-xs text-emerald-700">Attempted</div>
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
