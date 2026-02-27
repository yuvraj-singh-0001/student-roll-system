// यह API examCode के हिसाब से questions देता है
const Question = require("../../../models/Question");
const ExamConfig = require("../../../models/ExamConfig");

const CACHE_TTL_MS = Number(process.env.EXAM_QUESTIONS_CACHE_TTL_MS) || 180000;
const cache = new Map();

async function getExamQuestions(req, res) {
  try {
    const { examCode, mockTestCode } = req.query;

    const normalizedExamCode = String(examCode || "").trim();
    if (!normalizedExamCode) {
      return res.status(400).json({
        success: false,
        message: "examCode is required",
      });
    }

    const normalizedMockCode = String(mockTestCode || "").trim();

    const refreshFlag = String(req.query?.refresh || "").toLowerCase();
    const forceRefresh =
      refreshFlag === "1" ||
      refreshFlag === "true" ||
      (req.headers["x-force-refresh"] || "") === "1" ||
      String(req.headers["cache-control"] || "").includes("no-cache");

    const cacheKey = normalizedMockCode
      ? `${normalizedExamCode}__mock__${normalizedMockCode}`
      : `${normalizedExamCode}__main`;

    const cached = cache.get(cacheKey);
    if (
      !forceRefresh &&
      CACHE_TTL_MS > 0 &&
      cached &&
      Date.now() - cached.ts < CACHE_TTL_MS
    ) {
      res.set("Cache-Control", "private, max-age=180, stale-while-revalidate=60");
      return res.status(200).json(cached.payload);
    }

    const examConfig = await ExamConfig.findOne({ examCode: normalizedExamCode }).lean();

    const questionFilter = normalizedMockCode
      ? {
          examCode: normalizedExamCode,
          isMock: true,
          mockTestCode: normalizedMockCode,
        }
      : {
          examCode: normalizedExamCode,
          $or: [{ isMock: { $exists: false } }, { isMock: false }],
        };

    const questions = await Question.find(questionFilter)
      .select("-correctAnswer -correctAnswers")
      .sort({ questionNumber: 1 })
      .lean();

    if (!questions.length) {
      return res.status(200).json({
        success: true,
        exam: {
          examCode: normalizedExamCode,
          title: examConfig?.title || normalizedExamCode,
          durationMinutes: examConfig?.totalTimeMinutes || 60,
        },
        questions: [],
      });
    }

    const payload = {
      success: true,
      exam: {
        examCode: normalizedExamCode,
        title: examConfig?.title || normalizedExamCode,
        durationMinutes: examConfig?.totalTimeMinutes || 60,
      },
      questions,
    };
    cache.set(cacheKey, { ts: Date.now(), payload });
    res.set("Cache-Control", "private, max-age=180, stale-while-revalidate=60");
    return res.status(200).json(payload);
  } catch (err) {
    console.error("getExamQuestions error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = getExamQuestions;
