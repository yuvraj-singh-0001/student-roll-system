// यह API examCode के हिसाब से questions देता है
const Question = require("../../../models/Question");
const MockQuestion = require("../../../models/MockQuestion");
const ExamConfig = require("../../../models/ExamConfig");

const TYPE_ORDER = {
  simple: 1,
  multiple: 2,
  confidence: 3,
  x_option: 4,
  branch_parent: 5,
  branch_child: 6,
};

function normalizeBranchKey(value) {
  const key = String(value || "").trim().toUpperCase();
  return key === "A" || key === "B" ? key : null;
}

function inferType(q) {
  if (q?.type) return q.type;
  const options = Array.isArray(q?.options) ? q.options : [];
  if (options.length === 2) return "branch_parent";
  if (q?.branchKey && q?.parentQuestion) return "branch_child";
  if (q?.confidenceRequired) return "confidence";
  return "simple";
}

function orderQuestionsByType(list) {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const ta = inferType(a);
    const tb = inferType(b);
    const oa = TYPE_ORDER[ta] || 99;
    const ob = TYPE_ORDER[tb] || 99;
    if (oa !== ob) return oa - ob;
    if ((ta === "branch_child" || ta === "branch_parent") && (tb === "branch_child" || tb === "branch_parent")) {
      const ka = normalizeBranchKey(a?.branchKey);
      const kb = normalizeBranchKey(b?.branchKey);
      if (ka !== kb) {
         if (!ka) return 1; // parents usually have no branchKey, but they belong to the branch group
         if (!kb) return -1;
         return ka.localeCompare(kb);
      }
    }
    const qa = Number(a?.questionNumber) || 0;
    const qb = Number(b?.questionNumber) || 0;
    return qa - qb;
  });
}
async function getExamQuestions(req, res) {
  try {
    const { examCode, mockTestCode } = req.query || {};
    const normalizedExamCode = examCode ? String(examCode).trim() : "";
    if (!normalizedExamCode) {
      return res.status(400).json({
        success: false,
        message: "examCode is required",
      });
    }

    const normalizedMockCode = mockTestCode ? String(mockTestCode).trim() : "";

    const examConfig = await ExamConfig.findOne({ examCode: normalizedExamCode }).lean();

    const questionFilter = normalizedMockCode
      ? {
          examCode: normalizedExamCode,
          mockTestCode: normalizedMockCode,
        }
      : {
          examCode: normalizedExamCode,
          $or: [{ isMock: { $exists: false } }, { isMock: false }],
        };

    let questions = await (normalizedMockCode ? MockQuestion : Question)
      .find(questionFilter)
      .select("-correctAnswer -correctAnswers")
      .lean();

    // Legacy fallback for mock questions stored in Question collection
    if (normalizedMockCode && !questions.length) {
      questions = await Question.find({
        examCode: normalizedExamCode,
        isMock: true,
        mockTestCode: normalizedMockCode,
      })
        .select("-correctAnswer -correctAnswers")
        .lean();
    }

    // Sort questions by Type and then Number
    questions = orderQuestionsByType(questions);

    let mockTitle = "";
    let mockTimeMinutes = null;
    if (normalizedMockCode && questions.length) {
      const titleSource = questions.find((q) => q?.mockTitle);
      mockTitle = titleSource?.mockTitle ? String(titleSource.mockTitle).trim() : "";
      const timeSource = questions.find(
        (q) => Number.isFinite(Number(q?.mockTime)) && Number(q?.mockTime) > 0
      );
      if (timeSource) {
        const parsed = Number(timeSource.mockTime);
        if (Number.isFinite(parsed) && parsed > 0) {
          mockTimeMinutes = parsed;
        }
      }
    }

    const resolvedTitle =
      mockTitle || examConfig?.title || normalizedExamCode;
    const resolvedDuration =
      mockTimeMinutes || examConfig?.totalTimeMinutes || 60;

    if (!questions.length) {
      return res.status(200).json({
        success: true,
        exam: {
          examCode: normalizedExamCode,
          title: resolvedTitle,
          durationMinutes: resolvedDuration,
        },
        questions: [],
      });
    }

    const payload = {
      success: true,
      exam: {
        examCode: normalizedExamCode,
        title: resolvedTitle,
        durationMinutes: resolvedDuration,
      },
      questions,
    };
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
