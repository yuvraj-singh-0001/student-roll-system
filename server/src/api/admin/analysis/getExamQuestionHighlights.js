// This API returns question highlights for an examCode
const ExamAttempt = require("../../../models/ExamAttempt");
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

function normalizeBranchKey(value) {
  const key = String(value || "").trim().toUpperCase();
  return BRANCH_KEYS.includes(key) ? key : null;
}

function buildBranchChoices(answers) {
  const map = {};
  for (const a of answers || []) {
    if (a.type !== "branch_parent") continue;
    const selected = normalizeBranchKey(a.selectedAnswer);
    if (!selected) continue;
    map[String(a.questionNumber)] = selected;
  }
  return map;
}

function isBranchVisible(a, branchChoices) {
  if (a.type !== "branch_child") return true;
  if (!a.parentQuestion || !a.branchKey) return true;
  const choice = branchChoices[String(a.parentQuestion)];
  const branchKey = normalizeBranchKey(a.branchKey);
  if (!choice || !branchKey) return false;
  return choice === branchKey;
}

function pickMax(list, key) {
  if (!list.length) return null;
  return list.reduce((best, cur) => (cur[key] > best[key] ? cur : best));
}

function pickMin(list, key) {
  if (!list.length) return null;
  return list.reduce((best, cur) => (cur[key] < best[key] ? cur : best));
}

function buildBranchSummary(attempts, questionTextByNumber, branchParents) {
  const map = new Map();

  for (const parent of branchParents) {
    const key = String(parent.questionNumber);
    map.set(key, {
      questionNumber: parent.questionNumber,
      questionText: parent.questionText || "",
      selectedA: 0,
      selectedB: 0,
      notSelected: 0,
    });
  }

  for (const attempt of attempts) {
    const answers = attempt.answers || [];
    for (const a of answers) {
      if (a.type !== "branch_parent") continue;
      const key = String(a.questionNumber);
      let entry = map.get(key);
      if (!entry) {
        const qText = questionTextByNumber.get(key)?.questionText || "";
        entry = {
          questionNumber: a.questionNumber,
          questionText: qText,
          selectedA: 0,
          selectedB: 0,
          notSelected: 0,
        };
        map.set(key, entry);
      }
      const selected = normalizeBranchKey(a.selectedAnswer);
      if (selected === "A") entry.selectedA += 1;
      else if (selected === "B") entry.selectedB += 1;
      else entry.notSelected += 1;
    }
  }

  return Array.from(map.values()).sort((a, b) => a.questionNumber - b.questionNumber);
}

function buildStats(attempts) {
  const stats = new Map();
  const visibleQuestionNumbers = new Set();

  for (const attempt of attempts) {
    const scored = getVisibleScoredAnswers(attempt.answers || []);
    for (const a of scored) {
      const qn = Number(a.questionNumber);
      visibleQuestionNumbers.add(qn);

      const key = String(qn);
      let entry = stats.get(key);
      if (!entry) {
        entry = { attempted: 0, skipped: 0, correct: 0, wrong: 0 };
        stats.set(key, entry);
      }

      if (a.status === "attempted") {
        entry.attempted += 1;
        if (a.isCorrect === true) entry.correct += 1;
      } else {
        // Pending/not_visited are treated as skipped.
        entry.skipped += 1;
      }

      entry.wrong = Math.max(entry.attempted - entry.correct, 0);
    }
  }

  return { stats, visibleQuestionNumbers };
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

function summarizeAttemptForTotals(answers, questionsPerStudent) {
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
    const countA = group.A.size;
    const countB = group.B.size;
    branchContribution += Math.max(countA, countB);
  }

  return standardCount + branchContribution;
}

async function getLatestAttemptsByStudent(examCode) {
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
    { $replaceRoot: { newRoot: "$attempt" } },
    { $project: { answers: 1 } },
  ]);

  return grouped || [];
}

async function getExamQuestionHighlights(req, res) {
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
        questionText: 1,
        type: 1,
        parentQuestion: 1,
        branchKey: 1,
        options: 1,
      })
      .sort({ questionNumber: 1 })
      .lean();

    if (!questions.length) {
      return res.status(200).json({
        success: true,
        data: {
          examCode,
          totalQuestions: 0,
          uniqueQuestions: 0,
          totalStudents: 0,
          questionsPerStudent: 0,
          totalQuestionsActual: 0,
          totals: { attempted: 0, skipped: 0, correct: 0, wrong: 0, notVisited: 0 },
          highlights: {
            mostAttempted: null,
            leastAttempted: null,
            mostCorrect: null,
            mostWrong: null,
            mostSkipped: null,
          },
          list: [],
          branchSummary: [],
        },
      });
    }

    const questionsWithType = questions.map((q) => ({
      ...q,
      inferredType: inferType(q),
    }));
    const questionTextByNumber = new Map(
      questionsWithType.map((q) => [String(q.questionNumber), q])
    );
    const branchParents = questionsWithType.filter(
      (q) => q.inferredType === "branch_parent"
    );

    const attempts = await getLatestAttemptsByStudent(examCode);

    const branchSummary = buildBranchSummary(
      attempts,
      questionTextByNumber,
      branchParents
    );
    const { stats: statsMap, visibleQuestionNumbers } = buildStats(attempts);
    const totalStudents = attempts.length;
    const questionsPerStudent = computeQuestionsPerStudent(questionsWithType);

    const totals = { attempted: 0, skipped: 0, correct: 0, wrong: 0, notVisited: 0 };

    const list = Array.from(visibleQuestionNumbers)
      .sort((a, b) => a - b)
      .map((qn) => {
        const key = String(qn);
        const q = questionTextByNumber.get(key) || {};
        const a = statsMap.get(key) || {};
        const item = {
          questionNumber: qn,
          questionText: q.questionText || "",
          attempted: a.attempted || 0,
          skipped: a.skipped || 0,
          notVisited: 0,
          correct: a.correct || 0,
          wrong: Math.max((a.attempted || 0) - (a.correct || 0), 0),
        };
        return item;
      });

    for (const attempt of attempts) {
      const summary = summarizeAttemptForTotals(
        attempt.answers || [],
        questionsPerStudent
      );
      totals.attempted += summary.attempted;
      totals.skipped += summary.skipped;
      totals.correct += summary.correct;
      totals.wrong += summary.wrong;
    }

    const totalQuestionsActual = list.reduce(
      (sum, item) => sum + (item.attempted || 0) + (item.skipped || 0),
      0
    );
    const totalQuestions = totals.attempted + totals.skipped;

    const highlights = {
      mostAttempted: pickMax(list, "attempted"),
      leastAttempted: pickMin(list, "attempted"),
      mostCorrect: pickMax(list, "correct"),
      mostWrong: pickMax(list, "wrong"),
      mostSkipped: pickMax(list, "skipped"),
    };

    return res.status(200).json({
      success: true,
      data: {
        examCode,
        totalQuestions,
        uniqueQuestions: list.length,
        totalStudents,
        questionsPerStudent,
        totalQuestionsActual,
        totals,
        highlights,
        list,
        branchSummary,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = getExamQuestionHighlights;
