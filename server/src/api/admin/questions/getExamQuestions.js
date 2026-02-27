// यह API examCode के हिसाब से questions देता है
const Question = require("../../../models/Question");
const MockQuestion = require("../../../models/MockQuestion");
const ExamConfig = require("../../../models/ExamConfig");



async function getExamQuestions(req, res) {
  try {
    const { examCode, mockTestCode } = req.query || {};
    const normalizedExamCode = examCode ? String(examCode).trim() : "";
    if (!normalizedExamCode) {
      return res.status(400).json({
        success: false,
        message: "examCode is required",
      });
    }

    const normalizedMockCode = mockTestCode ? String(mockTestCode).trim() : "";

    const examConfig = await ExamConfig.findOne({ examCode: normalizedExamCode }).lean();

    const questionFilter = normalizedMockCode
      ? {
          examCode: normalizedExamCode,
          mockTestCode: normalizedMockCode,
        }
      : {
          examCode: normalizedExamCode,
          $or: [{ isMock: { $exists: false } }, { isMock: false }],
        };

    let questions = await (normalizedMockCode ? MockQuestion : Question)
      .find(questionFilter)
      .select("-correctAnswer -correctAnswers")
      .sort({ questionNumber: 1 })
      .lean();

    // Legacy fallback for mock questions stored in Question collection
    if (normalizedMockCode && !questions.length) {
      questions = await Question.find({
        examCode: normalizedExamCode,
        isMock: true,
        mockTestCode: normalizedMockCode,
      })
        .select("-correctAnswer -correctAnswers")
        .sort({ questionNumber: 1 })
        .lean();
    }

    let mockTitle = "";
    let mockTimeMinutes = null;
    if (normalizedMockCode && questions.length) {
      const titleSource = questions.find((q) => q?.mockTitle);
      mockTitle = titleSource?.mockTitle ? String(titleSource.mockTitle).trim() : "";
      const timeSource = questions.find(
        (q) => Number.isFinite(Number(q?.mockTime)) && Number(q?.mockTime) > 0
      );
      if (timeSource) {
        const parsed = Number(timeSource.mockTime);
        if (Number.isFinite(parsed) && parsed > 0) {
          mockTimeMinutes = parsed;
        }
      }
    }

    const resolvedTitle =
      mockTitle || examConfig?.title || normalizedExamCode;
    const resolvedDuration =
      mockTimeMinutes || examConfig?.totalTimeMinutes || 60;

    if (!questions.length) {
      return res.status(200).json({
        success: true,
        exam: {
          examCode: normalizedExamCode,
          title: resolvedTitle,
          durationMinutes: resolvedDuration,
        },
        questions: [],
      });
    }

    const payload = {
      success: true,
      exam: {
        examCode: normalizedExamCode,
        title: resolvedTitle,
        durationMinutes: resolvedDuration,
      },
      questions,
    };
    return res.status(200).json(payload);
  } catch (err) {
    console.error("getExamQuestions error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = getExamQuestions;
