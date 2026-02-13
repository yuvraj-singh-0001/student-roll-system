// backend/api/exam/attempts.js
const ExamAttempt = require("../../models/ExamAttempt");

const BRANCH_KEYS = ["A", "B"];

function buildBranchChoices(answers) {
  const map = {};
  (answers || []).forEach((a) => {
    if (a.type !== "branch_parent") return;
    if (!BRANCH_KEYS.includes(a.selectedAnswer)) return;
    map[String(a.questionNumber)] = a.selectedAnswer;
  });
  return map;
}

function isBranchVisible(a, branchChoices) {
  if (a.type !== "branch_child") return true;
  if (!a.parentQuestion || !a.branchKey) return true;
  const choice = branchChoices[String(a.parentQuestion)];
  if (!choice) return false;
  return choice === a.branchKey;
}

function buildSummary(attempt) {
  const answers = attempt.answers || [];
  const branchChoices = buildBranchChoices(answers);
  const scored = answers.filter(
    (a) => a.type !== "branch_parent" && isBranchVisible(a, branchChoices)
  );
  const attemptedCount = scored.filter((a) => a.status === "attempted").length;
  const skippedCount = scored.filter((a) => a.status === "skipped").length;
  const correctCount = scored.filter((a) => a.isCorrect === true).length;
  const wrongCount = scored.filter(
    (a) => a.isCorrect === false && a.status === "attempted"
  ).length;
  const notVisitedCount = scored.filter((a) => a.status === "not_visited").length;

  return { attemptedCount, skippedCount, correctCount, wrongCount, notVisitedCount };
}

async function listAttempts(req, res) {
  try {
    const { studentId, examCode } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const filter = { studentId: studentId.trim() };
    if (examCode) filter.examCode = examCode;

    const attempts = await ExamAttempt.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const data = attempts.map((a) => {
      const summary = buildSummary(a);
      return {
        attemptId: a._id,
        examCode: a.examCode,
        totalMarks: a.totalMarks,
        autoSubmitted: a.autoSubmitted,
        createdAt: a.createdAt,
        ...summary,
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("listAttempts error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getAttemptDetails(req, res) {
  try {
    const { attemptId } = req.params;
    const attempt = await ExamAttempt.findById(attemptId).lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    const summary = buildSummary(attempt);

    return res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        studentId: attempt.studentId,
        examCode: attempt.examCode,
        totalMarks: attempt.totalMarks,
        autoSubmitted: attempt.autoSubmitted,
        createdAt: attempt.createdAt,
        ...summary,
        answers: attempt.answers || [],
      },
    });
  } catch (err) {
    console.error("getAttemptDetails error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = { listAttempts, getAttemptDetails };
