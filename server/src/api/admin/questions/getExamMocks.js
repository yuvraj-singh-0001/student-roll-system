// backend/api/admin/questions/getExamMocks.js
// This API returns list of available mock tests for a given examCode.

const Question = require("../../../models/Question");
const MockQuestion = require("../../../models/MockQuestion");

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

    // Find distinct mockTestCode values for this exam in MockQuestion collection
    const mockPipeline = [
      {
        $match: {
          examCode: normalizedExamCode,
          mockTestCode: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$mockTestCode",
          questionCount: { $sum: 1 },
          mockTitle: { $first: "$mockTitle" },
          mockTime: { $first: "$mockTime" },
        },
      },
      {
        $project: {
          _id: 0,
          mockTestCode: "$_id",
          questionCount: 1,
          mockTitle: 1,
          mockTime: 1,
        },
      },
      {
        $sort: { mockTestCode: 1 },
      },
    ];

    let mocks = await MockQuestion.aggregate(mockPipeline).exec();

    // Legacy fallback: mocks stored in Question collection
    if (!mocks.length) {
      const legacyPipeline = [
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
            mockTitle: { $first: "$mockTitle" },
            mockTime: { $first: "$mockTime" },
          },
        },
        {
          $project: {
            _id: 0,
            mockTestCode: "$_id",
            questionCount: 1,
            mockTitle: 1,
            mockTime: 1,
          },
        },
        {
          $sort: { mockTestCode: 1 },
        },
      ];
      mocks = await Question.aggregate(legacyPipeline).exec();
    }

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
