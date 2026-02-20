// यह API olympiad exam submit करता है
// backend/api/student/olympiad/submitOlympiadExam.js
const Question = require("../../../models/Question");
const ExamAttempt = require("../../../models/ExamAttempt");

// --- scoring functions same ---

const VALID_OPTIONS = ["A", "B", "C", "D"];
const BRANCH_KEYS = ["A", "B"];

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
    reason: `Multiple: ${correctSelectedCount}/${totalCorrect} correct, ${marks.toFixed(
      2
    )} marks.`,
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

async function submitOlympiadExam(req, res) {
  try {
    const {
      examCode,
      attempts = [],
      autoSubmitted,
      studentId,
      startedAt,
      endedAt,
      durationSeconds,
      timeTakenSeconds,
    } = req.body;
    const normalizedExamCode = String(examCode || "").trim();
    const normalizedStudentId =
      typeof studentId === "string" ? studentId.trim() : "";

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

    if (!normalizedExamCode) {
      return res.status(400).json({
        success: false,
        message: "examCode is required",
      });
    }
    const questions = await Question.find({ examCode: normalizedExamCode }).lean();
    if (!questions.length) {
      return res.status(404).json({
        success: false,
        message: "No questions found for this examCode",
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
      let selectedAnswer = normalizeSelectedAnswer(att.selectedAnswer);
      let selectedAnswers = normalizeSelectedAnswers(att.selectedAnswers);

      // Raw confidence jo frontend se aaya
      const rawConfidence = att.confidence;
      // Scoring ke liye normalized confidence (yaha abhi bhi missing ko "mid" treat kar sakte hain)
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

      // Store side ke liye confidence: attempted questions me normalized, baaki me null
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
        // Result / analysis ke liye sirf user-selected confidence store karein
        confidence: storedConfidence,
        status,
        marks: result.marks,
        isCorrect: result.isCorrect,
        marksReason: result.reason,
      });
    }

    // ðŸ”´ IMPORTANT: db me attempt save karo
    const attemptDoc = new ExamAttempt({
      studentId: normalizedStudentId || null, // optional
      examCode: normalizedExamCode,
      totalMarks,
      autoSubmitted: !!autoSubmitted,
      startedAt: safeStartedAt,
      endedAt: safeEndedAt,
      durationSeconds: safeDurationSeconds,
      timeTakenSeconds: safeTimeTakenSeconds,
      answers: detailedAttempts,
    });

    await attemptDoc.save();

    const scoredAttempts = detailedAttempts.filter(
      (a) => a.type !== "branch_parent" && isBranchVisible(a)
    );

    // frontend ko same result return karo
    return res.status(200).json({
      success: true,
      examCode: normalizedExamCode,
      studentId: normalizedStudentId || null,
      totalMarks,
      detailedAttempts,
      attemptId: attemptDoc._id,
      autoSubmitted: !!autoSubmitted,
      attemptedCount: scoredAttempts.filter((a) => a.status === "attempted")
        .length,
      skippedCount: scoredAttempts.filter((a) => a.status === "skipped").length,
      correctCount: scoredAttempts.filter((a) => a.isCorrect === true).length,
      wrongCount: scoredAttempts.filter(
        (a) => a.isCorrect === false && a.status === "attempted"
      ).length,
    });
  } catch (err) {
    console.error("submitOlympiad error:", err);
    const isProd = process.env.NODE_ENV === "production";
    const allowDebug =
      !isProd || String(process.env.DEBUG_ERRORS || "").toLowerCase() === "true";
    const errorPayload = {
      success: false,
      message: "Internal server error",
      error: err.message,
      type: err.name,
      code: err.code,
    };
    if (err && err.errors && typeof err.errors === "object") {
      errorPayload.errorFields = Object.keys(err.errors);
    }
    if (allowDebug) {
      errorPayload.stack = err.stack || String(err);
    }
    return res.status(500).json(errorPayload);
  }
}

module.exports = submitOlympiadExam;
