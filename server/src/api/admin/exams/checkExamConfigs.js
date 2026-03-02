const ExamConfig = require("../../../models/ExamConfig");

async function checkExamConfigs(req, res) {
  try {
    const configs = await ExamConfig.find().lean();
    return res.status(200).json({
      success: true,
      data: {
        totalConfigs: configs.length,
        configs: configs.map(c => ({
          examCode: c.examCode,
          title: c.title,
          registrationPrice: c.registrationPrice,
          totalTimeMinutes: c.totalTimeMinutes,
          createdAt: c.createdAt
        }))
      }
    });
  } catch (err) {
    console.error("checkExamConfigs error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = checkExamConfigs;
