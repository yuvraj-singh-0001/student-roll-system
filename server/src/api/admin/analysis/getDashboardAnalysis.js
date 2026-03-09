// यह API analysis dashboard का data देता है
import { getStudentWiseData, getQuestionWiseData, getConfidenceWiseData } from "./analysisDataService.js";
import ExamAttempt from "../../../models/ExamAttempt.js";
import Question from "../../../models/Question.js";

async function getDashboardAnalysis(req, res) {
  try {
    const [studentList, qData, cData, totalsAgg, totalQuestions] =
      await Promise.all([
      getStudentWiseData(),
      getQuestionWiseData(),
      getConfidenceWiseData(),
      ExamAttempt.aggregate([
        { $unwind: "$answers" },
        {
          $group: {
            _id: null,
            attempted: {
              $sum: { $cond: [{ $eq: ["$answers.status", "attempted"] }, 1, 0] },
            },
            skipped: {
              $sum: { $cond: [{ $eq: ["$answers.status", "skipped"] }, 1, 0] },
            },
            correct: {
              $sum: { $cond: [{ $eq: ["$answers.isCorrect", true] }, 1, 0] },
            },
            wrong: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$answers.status", "attempted"] },
                      { $eq: ["$answers.isCorrect", false] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      Question.countDocuments(),
    ]);
    const agg = totalsAgg[0] || { attempted: 0, skipped: 0, correct: 0, wrong: 0 };
    return res.status(200).json({
      success: true,
      data: {
        studentWise: studentList,
        questionWise: qData,
        confidenceWise: cData,
        totals: { attempted: agg.attempted, skipped: agg.skipped, correct: agg.correct, wrong: agg.wrong },
        totalStudents: studentList.length,
        totalQuestions: totalQuestions || 0,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

export default getDashboardAnalysis;
