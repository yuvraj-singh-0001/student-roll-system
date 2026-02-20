// This API returns student-wise results for an examCode
const ExamAttempt = require("../../../models/ExamAttempt");
const Student = require("../../../models/Student");
const Question = require("../../../models/Question");

const BRANCH_KEYS = ["A", "B"];
const VALID_TYPES = [
  "simple",
  "multiple",
  "confidence",
  "branch_parent",
  "branch_child",
];

function inferType(q) {
  const options = Array.isArray(q?.options) ? q.options : [];
  if (options.length === 2) return "branch_parent";
  if (q && q.branchKey && q.parentQuestion) return "branch_child";
  if (q && VALID_TYPES.includes(q.type)) return q.type;
  if (q?.confidenceRequired) return "confidence";
  if (Array.isArray(q?.correctAnswers) && q.correctAnswers.length > 1) {
    return "multiple";
  }
  return "simple";
}

function computeQuestionsPerStudent(questions) {
  let standardCount = 0;
  const branchByParent = new Map();

  for (const q of questions || []) {
    const type = q.inferredType || q.type;

    if (type === "branch_parent") continue;

    if (type === "branch_child") {
      const parent = q.parentQuestion;
      const key = normalizeBranchKey(q.branchKey);
      const qn = Number(q.questionNumber);
      if (!parent || !key || !Number.isFinite(qn)) {
        standardCount += 1;
        continue;
      }

      const parentKey = String(parent);
      let group = branchByParent.get(parentKey);
      if (!group) {
        group = { A: new Set(), B: new Set() };
        branchByParent.set(parentKey, group);
      }
      group[key].add(qn);
      continue;
    }

    standardCount += 1;
  }

  let branchContribution = 0;
  for (const group of branchByParent.values()) {
    branchContribution += Math.max(group.A.size, group.B.size);
  }

  return standardCount + branchContribution;
}

function normalizeBranchKey(value) {
  const key = String(value || "").trim().toUpperCase();
  return BRANCH_KEYS.includes(key) ? key : null;
}

function buildBranchChoices(answers) {
  const map = {};
  (answers || []).forEach((a) => {
    if (a.type !== "branch_parent") return;
    const selected = normalizeBranchKey(a.selectedAnswer);
    if (!selected) return;
    map[String(a.questionNumber)] = selected;
  });
  return map;
}

function isBranchVisible(a, branchChoices) {
  if (a.type !== "branch_child") return true;
  if (!a.parentQuestion || !a.branchKey) return true;
  const choice = branchChoices[String(a.parentQuestion)];
  const branchKey = normalizeBranchKey(a.branchKey);
  if (!choice) return false;
  if (!branchKey) return false;
  return choice === branchKey;
}

function getVisibleScoredAnswers(answers) {
  const branchChoices = buildBranchChoices(answers);
  const byQuestion = new Map();

  for (const a of answers || []) {
    if (a.type === "branch_parent") continue;
    if (!isBranchVisible(a, branchChoices)) continue;
    const qn = Number(a.questionNumber);
    if (!Number.isFinite(qn)) continue;
    if (!byQuestion.has(qn)) {
      byQuestion.set(qn, a);
    }
  }

  return Array.from(byQuestion.values());
}

function summarizeAnswers(answers, questionsPerStudent = 0) {
  const scored = getVisibleScoredAnswers(answers);
  const attemptedAnswers = scored.filter((a) => a.status === "attempted");

  let attempted = attemptedAnswers.length;
  let correct = attemptedAnswers.filter((a) => a.isCorrect === true).length;
  if (questionsPerStudent > 0 && attempted > questionsPerStudent) {
    attempted = questionsPerStudent;
  }
  if (correct > attempted) correct = attempted;

  const wrong = Math.max(attempted - correct, 0);
  const skipped =
    questionsPerStudent > 0
      ? Math.max(questionsPerStudent - attempted, 0)
      : Math.max(scored.length - attempted, 0);

  return { attempted, skipped, correct, wrong };
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

    const questions = await Question.find({ examCode })
      .select({
        questionNumber: 1,
        type: 1,
        parentQuestion: 1,
        branchKey: 1,
        options: 1,
        confidenceRequired: 1,
        correctAnswers: 1,
      })
      .lean();

    const questionsWithType = questions.map((q) => ({
      ...q,
      inferredType: inferType(q),
    }));
    const questionsPerStudent = computeQuestionsPerStudent(questionsWithType);

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
      const summary = summarizeAnswers(answers, questionsPerStudent);
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
      questionsPerStudent,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = getExamStudentResults;
