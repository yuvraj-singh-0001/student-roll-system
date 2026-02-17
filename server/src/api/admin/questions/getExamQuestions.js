// यह API examCode के हिसाब से questions देता है
const Question = require("../../../models/Question");
const ExamConfig = require("../../../models/ExamConfig");

async function getExamQuestions(req, res) {
  try {
    const { examCode } = req.query;

    const normalizedExamCode = String(examCode || "").trim();
    if (!normalizedExamCode) {
      return res.status(400).json({
        success: false,
        message: "examCode is required",
      });
    }

    const examConfig = await ExamConfig.findOne({ examCode: normalizedExamCode }).lean();

    // Saare questions same examCode ke
    const questions = await Question.find({ examCode: normalizedExamCode })
      .select("-correctAnswer -correctAnswers")
      .sort({ questionNumber: 1 })
      .lean();

    if (!questions.length) {
      return res.status(200).json({
        success: true,
        exam: {
          examCode: normalizedExamCode,
          title: examConfig?.title || normalizedExamCode,
          durationMinutes: examConfig?.totalTimeMinutes || 60,
        },
        questions: [],
      });
    }

    return res.status(200).json({
      success: true,
      exam: {
        examCode: normalizedExamCode,
        title: examConfig?.title || normalizedExamCode,
        durationMinutes: examConfig?.totalTimeMinutes || 60,
      },
      questions,
    });
  } catch (err) {
    console.error("getExamQuestions error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = getExamQuestions;
