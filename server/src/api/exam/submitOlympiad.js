// backend/api/exam/submitOlympiad.js
const Question = require("../../models/Question");
const ExamAttempt = require("../../models/ExamAttempt");

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
    return { marks: -0.25, isCorrect: false, reason: "Multiple: wrong option selected (-0.25)." };
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

async function submitOlympiad(req, res) {
  try {
    const { examCode, attempts = [], autoSubmitted, studentId } = req.body;
    const normalizedExamCode = String(examCode || "").trim();
    const normalizedStudentId =
      typeof studentId === "string" ? studentId.trim() : "";

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

    const attemptMap = Object.fromEntries(
      (attempts || []).map((a) => [a.questionNumber, a || {}])
    );

    const branchChoices = {};
    for (const q of questions) {
      if (q.type !== "branch_parent") continue;
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
      const att = attemptMap[q.questionNumber] || {};
      let selectedAnswer = normalizeSelectedAnswer(att.selectedAnswer);
      let selectedAnswers = normalizeSelectedAnswers(att.selectedAnswers);
      const confidence = normalizeConfidence(att.confidence);

      if (q.type === "branch_parent" && !BRANCH_KEYS.includes(selectedAnswer)) {
        selectedAnswer = null;
      }

      const hasSelection =
        q.type === "multiple" ? selectedAnswers.length > 0 : !!selectedAnswer;

      let status = att.status;
      if (!["attempted", "skipped", "not_visited"].includes(status)) {
        status = "not_visited";
      }
      if (status === "attempted" && !hasSelection) status = "not_visited";
      if (status === "not_visited" && hasSelection) status = "attempted";

      let branchAllowed = true;
      if (q.type === "branch_child") {
        const choice = branchChoices[String(q.parentQuestion)];
        branchAllowed = !!choice && choice === q.branchKey;
      }
      if (!branchAllowed) {
        selectedAnswer = null;
        selectedAnswers = [];
        status = "not_visited";
      }

      let result = { marks: 0, isCorrect: null, reason: "" };

      const normalizedAttempt = {
        selectedAnswer,
        selectedAnswers,
        confidence,
      };

      if (q.type === "simple") result = calcSimple(q, normalizedAttempt);
      else if (q.type === "multiple") result = calcMultiple(q, normalizedAttempt);
      else if (q.type === "confidence") result = calcConfidence(q, normalizedAttempt);
      else if (q.type === "branch_child") result = calcBranchChild(q, normalizedAttempt);
      else if (q.type === "branch_parent") {
        result = { marks: 0, isCorrect: null, reason: "Branch parent: no marks." };
      }

      totalMarks += result.marks;

      detailedAttempts.push({
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        type: q.type,
        parentQuestion: q.parentQuestion ?? undefined,
        branchKey: q.branchKey ?? undefined,
        options: q.options,
        selectedAnswer,
        selectedAnswers,
        correctAnswer: q.correctAnswer || null,
        correctAnswers: q.correctAnswers || [],
        confidence: confidence || null,
        status,
        marks: result.marks,
        isCorrect: result.isCorrect,
        marksReason: result.reason,
      });
    }

    // 🔴 IMPORTANT: db me attempt save karo
    const attemptDoc = new ExamAttempt({
      studentId: normalizedStudentId || null, // optional
      examCode: normalizedExamCode,
      totalMarks,
      autoSubmitted: !!autoSubmitted,
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
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = submitOlympiad;
