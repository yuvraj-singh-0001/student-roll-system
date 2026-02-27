// यह API olympiad attempts की सूची और detail देता है
// backend/api/student/olympiad/olympiadAttempts.js
const ExamAttempt = require("../../../models/ExamAttempt");
const MockExamAttempt = require("../../../models/MockExamAttempt");

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

async function listOlympiadAttempts(req, res) {
  try {
    const { studentId, examCode, includeMock, mockTestCode } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const filter = { studentId: studentId.trim() };
    if (examCode) filter.examCode = examCode;

    const includeMocks =
      String(includeMock || "").toLowerCase() === "1" ||
      String(includeMock || "").toLowerCase() === "true";
    const normalizedMockTestCode = String(mockTestCode || "").trim();

    if (normalizedMockTestCode) {
      const mockFilter = { ...filter, mockTestCode: normalizedMockTestCode };
      const mockAttempts = await MockExamAttempt.find(mockFilter)
        .select({
          examCode: 1,
          mockTestCode: 1,
          totalMarks: 1,
          autoSubmitted: 1,
          createdAt: 1,
          attemptedCount: 1,
          skippedCount: 1,
          correctCount: 1,
          wrongCount: 1,
          notVisitedCount: 1,
        })
        .sort({ createdAt: -1 })
        .lean();

      const data = mockAttempts.map((a) => ({
        attemptId: a._id,
        examCode: a.examCode,
        mockTestCode: a.mockTestCode,
        totalMarks: a.totalMarks,
        autoSubmitted: a.autoSubmitted,
        createdAt: a.createdAt,
        attemptedCount: a.attemptedCount || 0,
        skippedCount: a.skippedCount || 0,
        correctCount: a.correctCount || 0,
        wrongCount: a.wrongCount || 0,
        notVisitedCount: a.notVisitedCount || 0,
        isMock: true,
      }));

      return res.status(200).json({ success: true, data });
    }

    const attempts = await ExamAttempt.find(filter)
      .select({
        examCode: 1,
        totalMarks: 1,
        autoSubmitted: 1,
        createdAt: 1,
        attemptedCount: 1,
        skippedCount: 1,
        correctCount: 1,
        wrongCount: 1,
        notVisitedCount: 1,
      })
      .sort({ createdAt: -1 })
      .lean();

    const missingSummaryIds = attempts
      .filter(
        (a) =>
          a.attemptedCount === undefined ||
          a.skippedCount === undefined ||
          a.correctCount === undefined ||
          a.wrongCount === undefined ||
          a.notVisitedCount === undefined
      )
      .map((a) => a._id);

    const fallbackSummaries = new Map();
    if (missingSummaryIds.length > 0) {
      const fallbackAttempts = await ExamAttempt.find({
        _id: { $in: missingSummaryIds },
      })
        .select({ answers: 1 })
        .lean();
      fallbackAttempts.forEach((a) => {
        fallbackSummaries.set(String(a._id), buildSummary(a));
      });
    }

    const mainData = attempts.map((a) => {
      const fallback = fallbackSummaries.get(String(a._id)) || {};
      const pick = (primary, secondary) => {
        if (Number.isFinite(primary)) return primary;
        if (Number.isFinite(secondary)) return secondary;
        return 0;
      };
      const summary = {
        attemptedCount: pick(a.attemptedCount, fallback.attemptedCount),
        skippedCount: pick(a.skippedCount, fallback.skippedCount),
        correctCount: pick(a.correctCount, fallback.correctCount),
        wrongCount: pick(a.wrongCount, fallback.wrongCount),
        notVisitedCount: pick(a.notVisitedCount, fallback.notVisitedCount),
      };
      return {
        attemptId: a._id,
        examCode: a.examCode,
        totalMarks: a.totalMarks,
        autoSubmitted: a.autoSubmitted,
        createdAt: a.createdAt,
        ...summary,
      };
    });

    if (!includeMocks) {
      return res.status(200).json({ success: true, data: mainData });
    }

    const mockAttempts = await MockExamAttempt.find(filter)
      .select({
        examCode: 1,
        mockTestCode: 1,
        totalMarks: 1,
        autoSubmitted: 1,
        createdAt: 1,
        attemptedCount: 1,
        skippedCount: 1,
        correctCount: 1,
        wrongCount: 1,
        notVisitedCount: 1,
      })
      .sort({ createdAt: -1 })
      .lean();

    const mockData = mockAttempts.map((a) => ({
      attemptId: a._id,
      examCode: a.examCode,
      mockTestCode: a.mockTestCode,
      totalMarks: a.totalMarks,
      autoSubmitted: a.autoSubmitted,
      createdAt: a.createdAt,
      attemptedCount: a.attemptedCount || 0,
      skippedCount: a.skippedCount || 0,
      correctCount: a.correctCount || 0,
      wrongCount: a.wrongCount || 0,
      notVisitedCount: a.notVisitedCount || 0,
      isMock: true,
    }));

    const data = [...mainData, ...mockData].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("listAttempts error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getOlympiadAttemptDetails(req, res) {
  try {
    const { attemptId } = req.params;
    let attempt = await ExamAttempt.findById(attemptId).lean();
    let isMock = false;

    if (!attempt) {
      attempt = await MockExamAttempt.findById(attemptId).lean();
      isMock = !!attempt;
    }

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
        mockTestCode: isMock ? attempt.mockTestCode : undefined,
        isMock,
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

module.exports = { listOlympiadAttempts, getOlympiadAttemptDetails };
