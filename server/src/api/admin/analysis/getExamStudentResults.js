// This API returns student-wise results for an examCode
const ExamAttempt = require("../../../models/ExamAttempt");
const Student = require("../../../models/Student");

const BRANCH_KEYS = ["A", "B"];

function buildBranchChoices(answers) {
  const map = {};
  (answers || []).forEach((a) => {
    if (a.type !== "branch_parent") return;
    if (!BRANCH_KEYS.includes(a.selectedAnswer)) return;
    map[String(a.questionNumber)] = a.selectedAnswer;
  });
  return map;
}

function isBranchVisible(a, branchChoices) {
  if (a.type !== "branch_child") return true;
  if (!a.parentQuestion || !a.branchKey) return true;
  const choice = branchChoices[String(a.parentQuestion)];
  if (!choice) return false;
  return choice === a.branchKey;
}

function summarizeAnswers(answers) {
  const branchChoices = buildBranchChoices(answers);
  const visible = (answers || []).filter((a) => isBranchVisible(a, branchChoices));
  const scored = visible.filter((a) => a.type !== "branch_parent");
  const out = { attempted: 0, skipped: 0, correct: 0, wrong: 0 };
  for (const a of scored) {
    if (a.status === "attempted") out.attempted += 1;
    if (a.status === "skipped") out.skipped += 1;
    if (a.isCorrect === true) out.correct += 1;
    if (a.isCorrect === false && a.status === "attempted") out.wrong += 1;
  }
  return out;
}

async function getExamStudentResults(req, res) {
  try {
    const examCode = String(req.query.examCode || "").trim();
    if (!examCode) {
      return res.status(400).json({
        success: false,
        message: "examCode is required",
      });
    }

    const grouped = await ExamAttempt.aggregate([
      { $match: { examCode } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          studentIdSafe: {
            $cond: [
              {
                $and: [
                  { $ne: ["$studentId", null] },
                  { $ne: ["$studentId", ""] },
                ],
              },
              "$studentId",
              null,
            ],
          },
        },
      },
      {
        $addFields: {
          groupKey: {
            $ifNull: [
              "$studentIdSafe",
              { $concat: ["__attempt__", { $toString: "$_id" }] },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$groupKey",
          attempt: { $first: "$$ROOT" },
        },
      },
    ]);

    const studentIds = grouped
      .map((g) => g.attempt?.studentId)
      .filter((id) => id && String(id).trim());

    const students = await Student.find({ rollNumber: { $in: studentIds } }).lean();
    const byId = Object.fromEntries(students.map((s) => [s.rollNumber, s]));

    const results = grouped.map((g) => {
      const attempt = g.attempt || {};
      const answers = attempt.answers || [];
      const summary = summarizeAnswers(answers);
      const rawStudentId = attempt.studentId ? String(attempt.studentId).trim() : "";
      const isGuest = !rawStudentId;
      const attemptId = attempt._id ? String(attempt._id) : "";
      const displayId = isGuest
        ? `GUEST-${attemptId.slice(-6) || "NA"}`
        : rawStudentId;
      const totalMarks = Number.isFinite(Number(attempt.totalMarks))
        ? Number(attempt.totalMarks)
        : answers.reduce((sum, a) => {
            const val = Number(a?.marks);
            return sum + (Number.isFinite(val) ? val : 0);
          }, 0);

      return {
        studentId: displayId,
        name: isGuest ? "Guest" : byId[rawStudentId]?.name ?? "-",
        email: isGuest ? "-" : byId[rawStudentId]?.email ?? "-",
        totalScore: totalMarks,
        attemptId: attempt._id,
        ...summary,
      };
    });

    results.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

    return res.status(200).json({
      success: true,
      data: results,
      totalStudents: results.length,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = getExamStudentResults;
