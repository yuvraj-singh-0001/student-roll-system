const Question = require("../../../models/Question");
const QuestionCounter = require("../../../models/QuestionCounter");
const ExamConfig = require("../../../models/ExamConfig");

async function addQuestion(req, res) {
  try {
    const {
      examCode,
      type,
      questionText,
      options,
      correctAnswer,
      correctAnswers,
      confidenceRequired,
      parentQuestion,
      branchKey,
      examTitle,
      totalTimeMinutes,
      registrationPrice,
    } = req.body;

    const normalizedExamCode = String(examCode || "").trim();
    const requiredOptionCount = type === "branch_parent" ? 2 : 4;
    if (!normalizedExamCode || !type || !questionText || !options || options.length !== requiredOptionCount) {
      return res.status(400).json({
        success: false,
        message: `examCode, type, questionText and exactly ${requiredOptionCount} options are required.`,
      });
    }

    // Type-specific validations
    if (type === "simple") {
      if (!correctAnswer) {
        return res.status(400).json({
          success: false,
          message: "correctAnswer is required for simple questions.",
        });
      }
    }

    if (type === "multiple") {
      if (!correctAnswers || !Array.isArray(correctAnswers) || correctAnswers.length === 0) {
        return res.status(400).json({
          success: false,
          message: "correctAnswers (array) is required for multiple questions.",
        });
      }
    }

    if (type === "confidence") {
      if (!correctAnswer) {
        return res.status(400).json({
          success: false,
          message: "correctAnswer is required for confidence questions.",
        });
      }
    }

    if (type === "branch_parent") {
      // parent question: no correctAnswer, no correctAnswers, no marks
      if (correctAnswer || (correctAnswers && correctAnswers.length)) {
        return res.status(400).json({
          success: false,
          message: "branch_parent must not have correctAnswer/correctAnswers.",
        });
      }
    }

    if (type === "branch_child") {
      if (!parentQuestion || !branchKey) {
        return res.status(400).json({
          success: false,
          message: "branch_child requires parentQuestion and branchKey.",
        });
      }
      if (!correctAnswer) {
        return res.status(400).json({
          success: false,
          message: "branch_child requires correctAnswer (simple marking).",
        });
      }
    }

    // Upsert exam basic info (if provided)
    const metaUpdate = {};
    if (typeof examTitle === "string" && examTitle.trim()) {
      metaUpdate.title = examTitle.trim();
    }
    if (totalTimeMinutes !== undefined && totalTimeMinutes !== null) {
      const num = Number(totalTimeMinutes);
      if (!Number.isNaN(num) && num > 0) {
        metaUpdate.totalTimeMinutes = num;
      }
    }
    if (registrationPrice !== undefined && registrationPrice !== null) {
      const num = Number(registrationPrice);
      if (!Number.isNaN(num) && num >= 0) {
        metaUpdate.registrationPrice = num;
      }
    }

    await ExamConfig.findOneAndUpdate(
      { examCode: normalizedExamCode },
      {
        $setOnInsert: { examCode: normalizedExamCode },
        ...(Object.keys(metaUpdate).length ? { $set: metaUpdate } : {}),
      },
      { upsert: true, new: true }
    );

    // Auto-generate questionNumber using atomic counter (no pipeline)
    const lastQuestion = await Question.findOne({ examCode: normalizedExamCode })
      .sort({ questionNumber: -1 })
      .lean();

    const startSeq = lastQuestion ? Number(lastQuestion.questionNumber) || 0 : 0;

    // ensure counter exists
    await QuestionCounter.updateOne(
      { examCode: normalizedExamCode },
      { $setOnInsert: { examCode: normalizedExamCode, seq: startSeq } },
      { upsert: true }
    );

    // if counter behind existing questions, sync it up
    await QuestionCounter.updateOne(
      { examCode: normalizedExamCode, seq: { $lt: startSeq } },
      { $set: { seq: startSeq } }
    );

    const counter = await QuestionCounter.findOneAndUpdate(
      { examCode: normalizedExamCode },
      { $inc: { seq: 1 } },
      { new: true }
    );
    if (!counter) {
      return res.status(500).json({
        success: false,
        message: "Counter init failed. Please retry.",
      });
    }

    const newQuestion = new Question({
      examCode: normalizedExamCode,
      questionNumber: counter.seq,
      type,
      questionText,
      options,
      correctAnswer: correctAnswer || undefined,
      correctAnswers: correctAnswers || undefined,
      confidenceRequired: type === "confidence" ? true : !!confidenceRequired,
      parentQuestion: parentQuestion || undefined,
      branchKey: branchKey || undefined,
    });

    await newQuestion.save();

    return res.status(201).json({
      success: true,
      message: "Question added successfully.",
      data: newQuestion,
    });
  } catch (err) {
    console.error("Error in addQuestion:", err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate questionNumber for this examCode.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

module.exports = addQuestion;
