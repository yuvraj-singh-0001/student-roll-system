const Student = require("../models/Student");
const Question = require("../models/Question");
const ExamAttempt = require("../models/ExamAttempt");

async function getStudentWiseData() {
  const attempts = await ExamAttempt.aggregate([
    { $unwind: "$answers" },
    {
      $group: {
        _id: "$studentId",
        totalScore: { $sum: "$answers.marks" },
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
  ]);
  const ids = attempts.map((a) => a._id);
  const students = await Student.find({ rollNumber: { $in: ids }, course: "Exam" }).lean();
  const byId = Object.fromEntries(students.map((s) => [s.rollNumber, s]));
  return attempts.map((a) => ({
    studentId: a._id,
    name: byId[a._id]?.name ?? "-",
    email: byId[a._id]?.email ?? "-",
    attempted: a.attempted,
    skipped: a.skipped,
    totalScore: a.totalScore,
    correct: a.correct,
    wrong: a.wrong,
  }));
}

async function getQuestionWiseData() {
  const attempts = await ExamAttempt.aggregate([
    { $unwind: "$answers" },
    { $match: { "answers.status": "attempted" } },
    {
      $group: {
        _id: "$answers.questionNumber",
        attemptCount: { $sum: 1 },
        wrongCount: {
          $sum: { $cond: [{ $eq: ["$answers.isCorrect", false] }, 1, 0] },
        },
        correctCount: {
          $sum: { $cond: [{ $eq: ["$answers.isCorrect", true] }, 1, 0] },
        },
      },
    },
  ]);
  const byQ = Object.fromEntries(attempts.map((a) => [a._id, a]));
  const allQ = await Question.find().sort({ questionNumber: 1 }).lean();
  const list = allQ.map((q) => {
    const a = byQ[q.questionNumber] || { attemptCount: 0, wrongCount: 0, correctCount: 0 };
    return {
      questionNumber: q.questionNumber,
      attemptCount: a.attemptCount,
      wrongCount: a.wrongCount,
      correctCount: a.correctCount,
      mostConfusing: a.attemptCount > 0 && a.wrongCount >= a.correctCount,
    };
  });
  const mostAttempted = list.length ? [...list].sort((a, b) => b.attemptCount - a.attemptCount)[0] : null;
  const leastAttempted = list.length ? [...list].sort((a, b) => a.attemptCount - b.attemptCount)[0] : null;
  const mostWrong = list.length ? [...list].sort((a, b) => b.wrongCount - a.wrongCount)[0] : null;
  const mostConfusing = list.filter((x) => x.mostConfusing && x.attemptCount > 0).sort((a, b) => b.wrongCount - a.wrongCount);
  return { list, mostAttempted, leastAttempted, mostWrong, mostConfusing: mostConfusing.slice(0, 10) };
}

async function getConfidenceWiseData() {
  const attempts = await ExamAttempt.aggregate([
    { $unwind: "$answers" },
    {
      $match: {
        "answers.status": "attempted",
        "answers.confidence": { $in: ["high", "mid", "low"] },
      },
    },
    {
      $group: {
        _id: { level: "$answers.confidence", correct: "$answers.isCorrect" },
        count: { $sum: 1 },
      },
    },
  ]);
  const out = {
    high: { correct: 0, wrong: 0 },
    mid: { correct: 0, wrong: 0 },
    low: { correct: 0, wrong: 0 },
  };
  for (const a of attempts) {
    const level = a._id.level || "mid";
    if (a._id.correct) out[level].correct += a.count;
    else out[level].wrong += a.count;
  }
  return out;
}

async function studentWise(req, res) {
  try {
    const data = await getStudentWiseData();
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function questionWise(req, res) {
  try {
    const data = await getQuestionWiseData();
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function confidenceWise(req, res) {
  try {
    const data = await getConfidenceWiseData();
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function dashboard(req, res) {
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

async function studentExamDetails(req, res) {
  try {
    const { studentId } = req.params;
    const attempt = await ExamAttempt.find({ studentId })
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
    }));

    return res.status(200).json({ success: true, data: details });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = { studentWise, questionWise, confidenceWise, dashboard, studentExamDetails };
