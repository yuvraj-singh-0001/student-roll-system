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

function buildEffectiveQuestionNumbers(questions, branchSummaryMap) {
  const effective = new Set();
  const branchGroups = new Map();

  for (const q of questions) {
    if (!q) continue;
    const qn = Number(q.questionNumber);
    if (!Number.isFinite(qn)) continue;

    const type = q.inferredType || q.type;

    if (type === "branch_parent") continue;

    const branchKey = normalizeBranchKey(q.branchKey);
    if (type === "branch_child" && q.parentQuestion && branchKey) {
      const parentKey = String(q.parentQuestion);
      let group = branchGroups.get(parentKey);
      if (!group) {
        group = { A: [], B: [] };
        branchGroups.set(parentKey, group);
      }
      group[branchKey].push(qn);
      continue;
    }

    effective.add(qn);
  }

  for (const [parentKey, group] of branchGroups.entries()) {
    const summary = branchSummaryMap.get(parentKey);
    const countA = summary?.selectedA || 0;
    const countB = summary?.selectedB || 0;

    let chosenKey = "A";
    if (countB > countA) {
      chosenKey = "B";
    } else if (countA === countB) {
      chosenKey = group.A.length >= group.B.length ? "A" : "B";
    }

    let chosenList = group[chosenKey] || [];
    if (!chosenList.length) {
      chosenList = group.A.length ? group.A : group.B;
    }

    for (const qn of chosenList) {
      effective.add(qn);
    }
  }

  return effective;
}

function buildStats(attempts) {
  const stats = new Map();

  for (const attempt of attempts) {
    const answers = attempt.answers || [];
    const branchChoices = {};

    for (const a of answers) {
      if (a.type !== "branch_parent") continue;
      const selected = normalizeBranchKey(a.selectedAnswer);
      if (!selected) continue;
      branchChoices[String(a.questionNumber)] = selected;
    }

    for (const a of answers) {
      if (a.type === "branch_parent") continue;

      if (a.type === "branch_child" && a.parentQuestion && a.branchKey) {
        const choice = branchChoices[String(a.parentQuestion)];
        const branchKey = normalizeBranchKey(a.branchKey);
        if (!choice || !branchKey || choice !== branchKey) continue;
      }

      const key = String(a.questionNumber);
      let entry = stats.get(key);
      if (!entry) {
        entry = { attempted: 0, skipped: 0, notVisited: 0, correct: 0, wrong: 0 };
        stats.set(key, entry);
      }
      if (a.status === "attempted") entry.attempted += 1;
      if (a.status === "skipped") entry.skipped += 1;
      if (a.status === "not_visited") entry.notVisited += 1;
      if (a.isCorrect === true) entry.correct += 1;
      if (a.isCorrect === false) entry.wrong += 1;
    }
  }

  return stats;
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

    const attempts = await ExamAttempt.find({ examCode })
      .select({ answers: 1 })
      .lean();

    const branchSummary = buildBranchSummary(
      attempts,
      questionTextByNumber,
      branchParents
    );
    const branchSummaryMap = new Map(
      branchSummary.map((b) => [String(b.questionNumber), b])
    );

    const statsMap = buildStats(attempts);
    const effectiveQuestionNumbers = buildEffectiveQuestionNumbers(
      questionsWithType,
      branchSummaryMap
    );

    const totals = { attempted: 0, skipped: 0, correct: 0, wrong: 0, notVisited: 0 };

    const list = Array.from(effectiveQuestionNumbers)
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
          notVisited: a.notVisited || 0,
          correct: a.correct || 0,
          wrong: a.wrong || 0,
        };
        totals.attempted += item.attempted;
        totals.skipped += item.skipped;
        totals.correct += item.correct;
        totals.wrong += item.wrong;
        totals.notVisited += item.notVisited;
        return item;
      });

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
        totalQuestions: list.length,
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
