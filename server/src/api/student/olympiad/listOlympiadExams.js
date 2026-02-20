// This API returns the list of olympiad exams
const ExamConfig = require("../../../models/ExamConfig");
const Question = require("../../../models/Question");

const CACHE_TTL_MS = Number(process.env.EXAM_LIST_CACHE_TTL_MS) || 300000;
let cachePayload = null;
let cacheTs = 0;

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
  return key === "A" || key === "B" ? key : null;
}

function buildExamQuestionStats(questions) {
  const byExam = new Map();

  for (const q of questions) {
    const code = q.examCode ? String(q.examCode).trim() : "";
    if (!code) continue;

    let entry = byExam.get(code);
    if (!entry) {
      entry = {
        totalAll: 0,
        standard: 0,
        branchByParent: new Map(),
      };
      byExam.set(code, entry);
    }

    entry.totalAll += 1;

    const type = inferType(q);

    if (type === "branch_parent") {
      continue;
    }

    if (type === "branch_child") {
      const parent = q.parentQuestion;
      const key = normalizeBranchKey(q.branchKey);
      if (!parent || !key) {
        entry.standard += 1;
        continue;
      }

      const parentKey = String(parent);
      let counts = entry.branchByParent.get(parentKey);
      if (!counts) {
        counts = { A: 0, B: 0 };
        entry.branchByParent.set(parentKey, counts);
      }
      if (key === "A" || key === "B") {
        counts[key] += 1;
      } else {
        entry.standard += 1;
      }
      continue;
    }

    entry.standard += 1;
  }

  const out = new Map();
  for (const [code, entry] of byExam.entries()) {
    let effective = entry.standard;
    for (const counts of entry.branchByParent.values()) {
      const a = counts.A || 0;
      const b = counts.B || 0;
      effective += Math.max(a, b);
    }
    out.set(code, {
      totalQuestions: effective,
      totalQuestionsAll: entry.totalAll,
    });
  }

  return out;
}

async function listOlympiadExams(req, res) {
  try {
    const now = Date.now();
    const refreshFlag = String(req.query?.refresh || "").toLowerCase();
    const forceRefresh =
      refreshFlag === "1" ||
      refreshFlag === "true" ||
      (req.headers["x-force-refresh"] || "") === "1" ||
      String(req.headers["cache-control"] || "").includes("no-cache");

    if (
      !forceRefresh &&
      CACHE_TTL_MS > 0 &&
      cachePayload &&
      now - cacheTs < CACHE_TTL_MS
    ) {
      res.set("Cache-Control", "private, max-age=300, stale-while-revalidate=60");
      return res.status(200).json(cachePayload);
    }

    const configs = await ExamConfig.find().sort({ createdAt: -1 }).lean();

    const questions = await Question.find()
      .select({ examCode: 1, type: 1, parentQuestion: 1, branchKey: 1, options: 1 })
      .lean();

    const countMap = buildExamQuestionStats(questions);

    const configMap = Object.fromEntries(
      configs.map((c) => [c.examCode, c])
    );

    const examCodes = new Set([
      ...Array.from(countMap.keys()),
      ...configs.map((c) => c.examCode),
    ]);

    const data = Array.from(examCodes).map((code) => {
      const c = configMap[code];
      const counts = countMap.get(code) || {
        totalQuestions: 0,
        totalQuestionsAll: 0,
      };
      return {
        examCode: code,
        title: c?.title || code,
        totalTimeMinutes: c?.totalTimeMinutes || 60,
        registrationPrice: c?.registrationPrice || 0,
        totalQuestions: counts.totalQuestions || 0,
        totalQuestionsAll: counts.totalQuestionsAll || 0,
        createdAt: c?.createdAt || null,
      };
    });

    const payload = { success: true, data };
    cachePayload = payload;
    cacheTs = Date.now();
    res.set("Cache-Control", "private, max-age=300, stale-while-revalidate=60");
    return res.status(200).json(payload);
  } catch (err) {
    console.error("listExams error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = listOlympiadExams;
