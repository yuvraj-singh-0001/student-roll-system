const ExamConfig = require("../../../models/ExamConfig");
const ExamInterest = require("../../../models/ExamInterest");
const { resolveStudentFromRequest } = require("./listOlympiadExams");

async function markExamInterested(req, res) {
  try {
    const examCode = String(req.body?.examCode || "").trim();
    if (!examCode) {
      return res.status(400).json({
        success: false,
        message: "examCode is required",
      });
    }

    const student = await resolveStudentFromRequest(req);
    if (!student?._id) {
      return res.status(401).json({
        success: false,
        message: "Student not found or not authenticated",
      });
    }

    const examExists = await ExamConfig.exists({ examCode });
    if (!examExists) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    await ExamInterest.updateOne(
      { examCode, studentId: student._id },
      { $setOnInsert: { examCode, studentId: student._id } },
      { upsert: true }
    );

    const interestedCount = await ExamInterest.countDocuments({ examCode });

    return res.status(200).json({
      success: true,
      message: "Interest saved",
      data: {
        examCode,
        studentInterested: true,
        interestedCount,
      },
    });
  } catch (err) {
    console.error("markExamInterested error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = markExamInterested;
