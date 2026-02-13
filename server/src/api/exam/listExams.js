// backend/api/exam/listExams.js
const ExamConfig = require("../../models/ExamConfig");
const Question = require("../../models/Question");

async function listExams(req, res) {
  try {
    const configs = await ExamConfig.find().sort({ createdAt: -1 }).lean();

    const counts = await Question.aggregate([
      {
        $group: {
          _id: "$examCode",
          totalQuestions: { $sum: 1 },
        },
      },
    ]);
    const countMap = Object.fromEntries(
      counts.map((c) => [c._id, c.totalQuestions])
    );
    const configMap = Object.fromEntries(
      configs.map((c) => [c.examCode, c])
    );

    const examCodes = new Set([
      ...Object.keys(countMap),
      ...configs.map((c) => c.examCode),
    ]);

    const data = Array.from(examCodes).map((code) => {
      const c = configMap[code];
      return {
        examCode: code,
        title: c?.title || code,
        totalTimeMinutes: c?.totalTimeMinutes || 60,
        registrationPrice: c?.registrationPrice || 0,
        totalQuestions: countMap[code] || 0,
        createdAt: c?.createdAt || null,
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("listExams error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = listExams;
