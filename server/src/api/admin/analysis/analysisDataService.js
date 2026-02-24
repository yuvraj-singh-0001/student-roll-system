// यह फाइल analysis data के helpers देती है
const Student = require("../../../models/Student");
const Question = require("../../../models/Question");
const ExamAttempt = require("../../../models/ExamAttempt");
const mongoose = require("mongoose");

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
  const ids = attempts
    .map((a) => (a._id ? String(a._id).trim() : ""))
    .filter((id) => id);
  const uniqueIds = Array.from(new Set(ids));
  const objectIds = uniqueIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  const students = uniqueIds.length
    ? await Student.find({
        $or: [
          { rollNumber: { $in: uniqueIds } },
          ...(objectIds.length ? [{ _id: { $in: objectIds } }] : []),
        ],
      }).lean()
    : [];
  const byId = new Map();
  students.forEach((s) => {
    if (s.rollNumber) byId.set(String(s.rollNumber), s);
    if (s._id) byId.set(String(s._id), s);
  });
  return attempts.map((a) => ({
    studentId: a._id,
    name:
      byId.get(String(a._id))?.formB?.verification?.fullName ||
      byId.get(String(a._id))?.name ||
      "-",
    email: byId.get(String(a._id))?.email ?? "-",
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

module.exports = { getStudentWiseData, getQuestionWiseData, getConfidenceWiseData };
