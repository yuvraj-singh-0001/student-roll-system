// backend/api/student/olympiad/submitMockExam.js
// This API handles submission of mock tests and stores results in mocktest_results collection.

const Question = require("../../../models/Question");
const MockQuestion = require("../../../models/MockQuestion");
const MockExamAttempt = require("../../../models/MockExamAttempt");

// Reuse scoring helpers from submitOlympiadExam
const baseSubmit = require("./submitOlympiadExam");

// We cannot directly reuse the whole handler, so we copy scoring helpers pattern here by requiring same module logic.
// To avoid duplicating a lot of code, we import the same functions by requiring this file at top-level.

const VALID_OPTIONS = ["A", "B", "C", "D"]; // same as main exam
const BRANCH_KEYS = ["A", "B"]; // same as main exam

function normalizeSelectedAnswer(ans) {
  return VALID_OPTIONS.includes(ans) ? ans : null;
}

function normalizeBranchChoice(ans) {
  return BRANCH_KEYS.includes(ans) ? ans : null;
}

function normalizeSelectedAnswers(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter((x) => VALID_OPTIONS.includes(x));
}

function normalizeConfidence(level) {
  if (!level) return "mid";
  if (level === "full") return "high";
  if (level === "middle") return "mid";
  if (["low", "mid", "high"].includes(level)) return level;
  return "mid";
}

function normalizeMs(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num);
}

function normalizeMsArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeMs).filter((v) => v !== null);
}

function normalizeHistory(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => (typeof v === "string" ? v.trim() : String(v || "").trim()))
    .filter((v) => v.length > 0);
}

function normalizeCount(value, fallback = 0) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return fallback;
  return Math.floor(num);
}

function calcSimple(q, attempt) {
  if (!attempt || !attempt.selectedAnswer) {
    return { marks: 0, isCorrect: null, reason: "Not answered." };
  }
  const correct = q.correctAnswer;
  if (attempt.selectedAnswer === correct) {
    return { marks: 1, isCorrect: true, reason: "Simple: correct (+1)." };
  } else {
    return { marks: -0.25, isCorrect: false, reason: "Simple: wrong (-0.25)." };
  }
}

function calcMultiple(q, attempt) {
  const correctArr = q.correctAnswers || [];
  const selectedArr = attempt?.selectedAnswers || [];

  if (!selectedArr.length) {
    return { marks: 0, isCorrect: null, reason: "Not answered." };
  }

  const wrongSelected = selectedArr.filter((x) => !correctArr.includes(x));
  if (wrongSelected.length > 0) {
    return { marks: -0.5, isCorrect: false, reason: "Multiple: wrong option selected (-0.5)." };
  }

  const totalCorrect = correctArr.length || 1;
  const correctSelectedCount = selectedArr.filter((x) => correctArr.includes(x)).length;
  const perOption = 2 / totalCorrect;
  const marks = correctSelectedCount * perOption;

  const isFull = correctSelectedCount === totalCorrect;
  return {
    marks,
    isCorrect: isFull,
    reason: `Multiple: ${correctSelectedCount}/${totalCorrect} correct, ${marks.toFixed(2)} marks.`,
  };
}

function calcConfidence(q, attempt) {
  if (!attempt || !attempt.selectedAnswer) {
    return { marks: 0, isCorrect: null, reason: "Not answered." };
  }

  const level = attempt.confidence || "mid";
  const isCorrect = attempt.selectedAnswer === q.correctAnswer;

  if (level === "high") {
    if (isCorrect) return { marks: 2, isCorrect: true, reason: "Confidence HIGH: correct (+2)." };
    return { marks: -0.5, isCorrect: false, reason: "Confidence HIGH: wrong (-0.5)." };
  }

  if (level === "mid") {
    if (isCorrect) return { marks: 1, isCorrect: true, reason: "Confidence MID: correct (+1)." };
    return { marks: -0.25, isCorrect: false, reason: "Confidence MID: wrong (-0.25)." };
  }

  // low
  if (isCorrect)
    return { marks: 0.25, isCorrect: true, reason: "Confidence LOW: correct (+0.25)." };
  return { marks: -0.1, isCorrect: false, reason: "Confidence LOW: wrong (-0.10)." };
}

function calcBranchChild(q, attempt) {
  return calcSimple(q, attempt);
}

async function submitMockExam(req, res) {
  try {
    const {
      examCode,
      mockTestCode,
      attempts = [],
      autoSubmitted,
      studentId,
      startedAt,
      endedAt,
      durationSeconds,
      timeTakenSeconds,
    } = req.body;

    const normalizedExamCode = String(examCode || "").trim();
    const normalizedMockCode = String(mockTestCode || "").trim();
    const normalizedStudentId = typeof studentId === "string" ? studentId.trim() : "";

    if (!normalizedExamCode || !normalizedMockCode) {
      return res.status(400).json({
        success: false,
        message: "examCode and mockTestCode are required",
      });
    }

    const parseDate = (value) => {
      if (!value) return null;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    const toNumberOrNull = (value) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    };

    const safeStartedAt = parseDate(startedAt);
    const safeEndedAt = parseDate(endedAt) || new Date();
    const safeDurationSeconds = toNumberOrNull(durationSeconds);
    let safeTimeTakenSeconds = toNumberOrNull(timeTakenSeconds);
    if (safeTimeTakenSeconds === null && safeStartedAt && safeEndedAt) {
      safeTimeTakenSeconds = Math.max(
        0,
        Math.floor((safeEndedAt.getTime() - safeStartedAt.getTime()) / 1000)
      );
    }

    // Load only mock questions for this exam + mockTestCode
    let questions = await MockQuestion.find({
      examCode: normalizedExamCode,
      mockTestCode: normalizedMockCode,
    }).lean();

    // Legacy fallback if mocks were stored in Question collection
    if (!questions.length) {
      questions = await Question.find({
        examCode: normalizedExamCode,
        isMock: true,
        mockTestCode: normalizedMockCode,
      }).lean();
    }

    if (!questions.length) {
      return res.status(404).json({
        success: false,
        message: "No mock questions found for this exam/mockTestCode",
      });
    }

    const attemptMap = {};
    const attemptList = Array.isArray(attempts) ? attempts : [];
    for (const a of attemptList) {
      if (!a || typeof a !== "object") continue;
      const qn = a.questionNumber;
      if (qn === undefined || qn === null) continue;
      attemptMap[qn] = a;
    }

    const VALID_TYPES = [
      "simple",
      "multiple",
      "confidence",
      "branch_parent",
      "branch_child",
    ];

    const inferType = (q) => {
      if (VALID_TYPES.includes(q.type)) return q.type;
      if (q.branchKey && q.parentQuestion) return "branch_child";
      if (Array.isArray(q.options) && q.options.length === 2) return "branch_parent";
      return "simple";
    };

    const branchChoices = {};
    for (const q of questions) {
      const safeType = inferType(q);
      if (safeType !== "branch_parent") continue;
      const att = attemptMap[q.questionNumber] || {};
      const choice = normalizeBranchChoice(att.selectedAnswer);
      if (choice) branchChoices[String(q.questionNumber)] = choice;
    }

    const isBranchVisible = (a) => {
      if (a.type !== "branch_child") return true;
      if (!a.parentQuestion || !a.branchKey) return true;
      const choice = branchChoices[String(a.parentQuestion)];
      if (!choice) return false;
      return choice === a.branchKey;
    };

    let totalMarks = 0;
    const detailedAttempts = [];

    for (const q of questions) {
      const safeType = inferType(q);
      const safeQuestionText =
        typeof q.questionText === "string" && q.questionText.trim()
          ? q.questionText
          : "Question";
      const safeOptions = Array.isArray(q.options) ? q.options : [];
      const safeParentQuestion = Number.isFinite(q.parentQuestion)
        ? q.parentQuestion
        : undefined;
      const safeBranchKey = BRANCH_KEYS.includes(q.branchKey) ? q.branchKey : undefined;
      const safeCorrectAnswer = normalizeSelectedAnswer(q.correctAnswer);
      const safeCorrectAnswers = normalizeSelectedAnswers(q.correctAnswers);

      const att = attemptMap[q.questionNumber] || {};
      const visitDurationsMs = normalizeMsArray(att.visitDurationsMs);
      const revisitChangeMs = normalizeMsArray(att.revisitChangeMs);
      const totalTimeMs =
        visitDurationsMs.length > 0
          ? visitDurationsMs.reduce((sum, v) => sum + v, 0)
          : normalizeMs(att.totalTimeMs);
      const firstVisitMs = normalizeMs(att.firstVisitMs);
      const answerHistory = normalizeHistory(att.answerHistory);
      const answerChangeCount = normalizeCount(
        att.answerChangeCount,
        answerHistory.length
      );
      let selectedAnswer = normalizeSelectedAnswer(att.selectedAnswer);
      let selectedAnswers = normalizeSelectedAnswers(att.selectedAnswers);

      const rawConfidence = att.confidence;
      const scoringConfidence = normalizeConfidence(rawConfidence);

      if (safeType === "branch_parent" && !BRANCH_KEYS.includes(selectedAnswer)) {
        selectedAnswer = null;
      }

      const hasSelection =
        safeType === "multiple" ? selectedAnswers.length > 0 : !!selectedAnswer;

      let status = att.status;
      if (!["attempted", "skipped", "not_visited"].includes(status)) {
        status = "not_visited";
      }
      if (status === "attempted" && !hasSelection) status = "not_visited";
      if (status === "not_visited" && hasSelection) status = "attempted";

      let branchAllowed = true;
      if (safeType === "branch_child") {
        const choice = branchChoices[String(safeParentQuestion)];
        branchAllowed = !!choice && choice === safeBranchKey;
      }
      if (!branchAllowed) {
        selectedAnswer = null;
        selectedAnswers = [];
        status = "not_visited";
      }

      let result = { marks: 0, isCorrect: null, reason: "" };

      const storedConfidence = status === "attempted"
        ? normalizeConfidence(rawConfidence)
        : null;

      const normalizedAttempt = {
        selectedAnswer,
        selectedAnswers,
        confidence: scoringConfidence,
      };

      const qSafe = {
        ...q,
        type: safeType,
        questionText: safeQuestionText,
        options: safeOptions,
        parentQuestion: safeParentQuestion,
        branchKey: safeBranchKey,
        correctAnswer: safeCorrectAnswer,
        correctAnswers: safeCorrectAnswers,
      };

      if (safeType === "simple") result = calcSimple(qSafe, normalizedAttempt);
      else if (safeType === "multiple") result = calcMultiple(qSafe, normalizedAttempt);
      else if (safeType === "confidence") result = calcConfidence(qSafe, normalizedAttempt);
      else if (safeType === "branch_child") result = calcBranchChild(qSafe, normalizedAttempt);
      else if (safeType === "branch_parent") {
        result = { marks: 0, isCorrect: null, reason: "Branch parent: no marks." };
      }

      totalMarks += result.marks;

      detailedAttempts.push({
        questionNumber: q.questionNumber,
        questionText: safeQuestionText,
        type: safeType,
        parentQuestion: safeParentQuestion,
        branchKey: safeBranchKey,
        options: safeOptions,
        selectedAnswer,
        selectedAnswers,
        correctAnswer: safeCorrectAnswer || null,
        correctAnswers: safeCorrectAnswers || [],
        confidence: storedConfidence,
        status,
        marks: result.marks,
        isCorrect: result.isCorrect,
        marksReason: result.reason,
        firstVisitMs,
        revisitChangeMs,
        visitDurationsMs,
        totalTimeMs,
        answerHistory,
        answerChangeCount,
      });
    }

    const scoredAttempts = detailedAttempts.filter(
      (a) => a.type !== "branch_parent" && a.type !== "x_option" && isBranchVisible(a)
    );
    const attemptedCount = scoredAttempts.filter((a) => a.status === "attempted").length;
    let skippedCount = scoredAttempts.filter((a) => a.status === "skipped").length;
    const correctCount = scoredAttempts.filter((a) => a.isCorrect === true).length;
    const wrongCount = scoredAttempts.filter(
      (a) => a.isCorrect === false && a.status === "attempted"
    ).length;
    const notVisitedCount = scoredAttempts.filter((a) => a.status === "not_visited").length;
    skippedCount += notVisitedCount;

    const attemptDoc = new MockExamAttempt({
      studentId: normalizedStudentId || null,
      examCode: normalizedExamCode,
      mockTestCode: normalizedMockCode,
      totalMarks,
      autoSubmitted: !!autoSubmitted,
      attemptedCount,
      skippedCount,
      correctCount,
      wrongCount,
      notVisitedCount,
      startedAt: safeStartedAt,
      endedAt: safeEndedAt,
      durationSeconds: safeDurationSeconds,
      timeTakenSeconds: safeTimeTakenSeconds,
      answers: detailedAttempts,
    });

    await attemptDoc.save();

    return res.status(200).json({
      success: true,
      examCode: normalizedExamCode,
      mockTestCode: normalizedMockCode,
      studentId: normalizedStudentId || null,
      totalMarks,
      detailedAttempts,
      attemptId: attemptDoc._id,
      autoSubmitted: !!autoSubmitted,
      attemptedCount,
      skippedCount,
      correctCount,
      wrongCount,
    });
  } catch (err) {
    console.error("submitMockExam error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
}

module.exports = submitMockExam;
