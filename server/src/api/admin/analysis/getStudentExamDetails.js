// यह API student के latest exam details देता है
const ExamAttempt = require("../../../models/ExamAttempt");

async function getStudentExamDetails(req, res) {
  try {
    const { studentId } = req.params;
    const examCode = String(req.query.examCode || "").trim();
    const filter = { studentId };
    if (examCode) filter.examCode = examCode;
    const attempt = await ExamAttempt.find(filter)
      .sort({ createdAt: -1 })
      .limit(1)
      .lean();

    if (!attempt.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    const answers = attempt[0].answers || [];
    const details = answers.map((a) => ({
      questionNumber: a.questionNumber,
      question: a.questionText || "-",
      correctAnswer: a.correctAnswer || "-",
      correctAnswers: a.correctAnswers || [],
      studentAnswer: a.selectedAnswer || "-",
      studentAnswers: a.selectedAnswers || [],
      isCorrect: a.isCorrect,
      status: a.status,
      confidenceLevel: a.confidence || null,
      marks: a.marks,
      marksReason: a.marksReason || "",
      type: a.type,
      parentQuestion: a.parentQuestion,
      branchKey: a.branchKey,
    }));

    return res.status(200).json({ success: true, data: details });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = getStudentExamDetails;
