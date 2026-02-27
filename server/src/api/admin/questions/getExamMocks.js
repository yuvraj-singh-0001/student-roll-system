// backend/api/admin/questions/getExamMocks.js
// This API returns list of available mock tests for a given examCode.

const Question = require("../../../models/Question");

async function getExamMocks(req, res) {
  try {
    const { examCode } = req.query;
    const normalizedExamCode = String(examCode || "").trim();

    if (!normalizedExamCode) {
      return res.status(400).json({
        success: false,
        message: "examCode is required",
      });
    }

    // Find distinct mockTestCode values for this exam where isMock=true
    const pipeline = [
      {
        $match: {
          examCode: normalizedExamCode,
          isMock: true,
          mockTestCode: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$mockTestCode",
          questionCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          mockTestCode: "$_id",
          questionCount: 1,
        },
      },
      {
        $sort: { mockTestCode: 1 },
      },
    ];

    const mocks = await Question.aggregate(pipeline).exec();

    return res.status(200).json({
      success: true,
      data: mocks,
    });
  } catch (err) {
    console.error("getExamMocks error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = getExamMocks;
