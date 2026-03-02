// This API returns the list of olympiad exams
const ExamConfig = require("../../../models/ExamConfig");
const Question = require("../../../models/Question");
const MockQuestion = require("../../../models/MockQuestion");
const Student = require("../../../models/Student");
const User = require("../../../models/User");
const jwt = require("jsonwebtoken");



const VALID_TYPES = [
  "simple",
  "multiple",
  "confidence",
  "branch_parent",
  "branch_child",
];

const PAYMENT_VALIDITY_DAYS = 10;
const PAYMENT_VALIDITY_MS = PAYMENT_VALIDITY_DAYS * 24 * 60 * 60 * 1000;

function readAuthToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const headerToken =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;
  return req.cookies?.token || headerToken || req.headers["x-auth-token"] || "";
}

function toDateOrNull(value) {
  if (!value) return null;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

async function resolveStudentFromRequest(req) {
  let userId = req.user?.userId;
  if (!userId) {
    const token = readAuthToken(req);
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded?.userId;
      } catch {
        userId = undefined;
      }
    }
  }

  if (!userId) return null;

  let student = await Student.findById(userId).lean();
  if (student) return student;

  const user = await User.findById(userId).lean();
  if (!user?.email) return null;

  student = await Student.findOne({
    $or: [{ email: user.email }, { "formB.contact.email": user.email }],
  }).lean();
  return student || null;
}

function deriveStudentPaymentInfo(student, nowMs) {
  if (!student) {
    return {
      isStudentPaid: false,
      payment: null,
      paymentAvailableFrom: null,
      paymentValidTill: null,
      isPaymentValidityActive: false,
    };
  }

  const paymentStatus = String(student.payment?.status || "").toLowerCase();
  const paid = paymentStatus === "success" || !!student.isPaid;
  const paidAt =
    toDateOrNull(student.payment?.paidAt) ||
    (paid ? toDateOrNull(student.updatedAt) || toDateOrNull(student.createdAt) : null);
  const validTill = paidAt ? new Date(paidAt.getTime() + PAYMENT_VALIDITY_MS) : null;
  const isActive = !!(paid && validTill && nowMs <= validTill.getTime());

  return {
    isStudentPaid: paid,
    payment: {
      paymentId: student.payment?.paymentId || "",
      amount: Number(student.payment?.amount) || 0,
      status: paymentStatus || (paid ? "success" : "pending"),
      paidAt: paidAt ? paidAt.toISOString() : null,
    },
    paymentAvailableFrom: paidAt ? paidAt.toISOString() : null,
    paymentValidTill: validTill ? validTill.toISOString() : null,
    isPaymentValidityActive: isActive,
  };
}

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
    const [configs, student, totalRegisteredPaidStudents, legacyMockCodes, mockCodes] =
      await Promise.all([
        ExamConfig.find().sort({ createdAt: -1 }).lean(),
        resolveStudentFromRequest(req),
        Student.countDocuments({
          course: "Exam",
          $or: [{ isPaid: true }, { "payment.status": "success" }],
        }),
        Question.distinct("examCode", {
          isMock: true,
          mockTestCode: { $exists: true, $ne: "" },
        }),
        MockQuestion.distinct("examCode", {
          mockTestCode: { $exists: true, $ne: "" },
        }),
      ]);

    const questions = await Question.find({
      $or: [{ isMock: { $exists: false } }, { isMock: false }],
    })
      .select({ examCode: 1, type: 1, parentQuestion: 1, branchKey: 1, options: 1 })
      .lean();

    const countMap = buildExamQuestionStats(questions);
    const mockExamCodeSet = new Set([...(legacyMockCodes || []), ...(mockCodes || [])]);
    const studentPaymentInfo = deriveStudentPaymentInfo(student, now);

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
      const examStartAt = toDateOrNull(c?.examStartAt);
      const examEndAt = toDateOrNull(c?.examEndAt);
      const startsOk = !examStartAt || now >= examStartAt.getTime();
      const endsOk = !examEndAt || now <= examEndAt.getTime();
      const isExamWindowActive = startsOk && endsOk;
      const canStartExam =
        studentPaymentInfo.isStudentPaid &&
        studentPaymentInfo.isPaymentValidityActive &&
        isExamWindowActive;

      return {
        examCode: code,
        title: c?.title || code,
        totalTimeMinutes: c?.totalTimeMinutes || 60,
        registrationPrice: c?.registrationPrice || 0,
        examStartAt: examStartAt ? examStartAt.toISOString() : null,
        examEndAt: examEndAt ? examEndAt.toISOString() : null,
        totalQuestions: counts.totalQuestions || 0,
        totalQuestionsAll: counts.totalQuestionsAll || 0,
        totalRegisteredPaidStudents: Number(totalRegisteredPaidStudents) || 0,
        paymentValidityDays: PAYMENT_VALIDITY_DAYS,
        isStudentPaid: studentPaymentInfo.isStudentPaid,
        payment: studentPaymentInfo.payment,
        paymentAvailableFrom: studentPaymentInfo.paymentAvailableFrom,
        paymentValidTill: studentPaymentInfo.paymentValidTill,
        isPaymentValidityActive: studentPaymentInfo.isPaymentValidityActive,
        isExamWindowActive,
        canStartExam,
        hasMocks: mockExamCodeSet.has(code),
        createdAt: c?.createdAt || null,
      };
    });

    const payload = { success: true, data };
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
