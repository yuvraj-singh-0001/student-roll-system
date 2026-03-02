// This API returns the list of olympiad exams
const ExamConfig = require("../../../models/ExamConfig");
const Question = require("../../../models/Question");
const MockQuestion = require("../../../models/MockQuestion");
const Student = require("../../../models/Student");
const Payment = require("../../../models/Payment");
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

function readStudentIdentifier(req) {
  const fromQuery = String(req.query?.studentId || req.query?.studentIdentifier || "").trim();
  if (fromQuery) return fromQuery;
  const fromHeader = String(req.headers?.["x-student-id"] || "").trim();
  if (fromHeader) return fromHeader;
  return "";
}

function toDateOrNull(value) {
  if (!value) return null;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

async function resolveStudentFromRequest(req) {
  const explicitStudentIdentifier = readStudentIdentifier(req);
  if (explicitStudentIdentifier) {
    const byId =
      explicitStudentIdentifier.match(/^[a-f\d]{24}$/i)
        ? await Student.findById(explicitStudentIdentifier).lean()
        : null;
    if (byId) return byId;

    const byRoll = await Student.findOne({
      rollNumber: explicitStudentIdentifier,
    })
      .sort({ createdAt: -1 })
      .lean();
    if (byRoll) return byRoll;
  }

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
  })
    .sort({ createdAt: -1 })
    .lean();
  return student || null;
}

function buildStudentExamPaymentMap(student) {
  const map = new Map();
  if (!student || !Array.isArray(student.examPayments)) return map;

  for (const entry of student.examPayments) {
    const code = String(entry?.examCode || "").trim();
    if (!code) continue;
    const paidAt = toDateOrNull(entry?.paidAt);
    const prev = map.get(code);
    if (!prev) {
      map.set(code, entry);
      continue;
    }
    const prevPaidAt = toDateOrNull(prev?.paidAt);
    if (!prevPaidAt || (paidAt && paidAt.getTime() > prevPaidAt.getTime())) {
      map.set(code, entry);
    }
  }

  return map;
}

function deriveExamPaymentInfo(paymentEntry, nowMs) {
  const status = String(paymentEntry?.status || "").toLowerCase();
  const paid = status === "success";
  const paidAt = paid
    ? toDateOrNull(paymentEntry?.paidAt) || toDateOrNull(new Date())
    : null;
  const validTill = paidAt ? new Date(paidAt.getTime() + PAYMENT_VALIDITY_MS) : null;
  const isActive = !!(paid && validTill && nowMs <= validTill.getTime());

  return {
    isStudentPaid: paid,
    payment: paid
      ? {
          paymentId: paymentEntry?.paymentId || "",
          amount: Number(paymentEntry?.amount) || 0,
          status: "success",
          paidAt: paidAt ? paidAt.toISOString() : null,
        }
      : null,
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
    
    // First resolve student separately to avoid temporal dead zone
    const student = await resolveStudentFromRequest(req);
    
    const [configs, paidCountsAgg, legacyGeneralPaidCount, legacyMockCodes, mockCodes, studentPayments] =
      await Promise.all([
        ExamConfig.find().sort({ createdAt: -1 }).lean(),
        Student.aggregate([
          { $unwind: "$examPayments" },
          { $match: { "examPayments.status": "success" } },
          {
            $group: {
              _id: {
                examCode: "$examPayments.examCode",
                studentId: "$_id",
              },
            },
          },
          {
            $group: {
              _id: "$_id.examCode",
              total: { $sum: 1 },
            },
          },
        ]),
        Student.countDocuments({
          isPaid: true,
          "payment.status": "success",
          examPayments: {
            $not: {
              $elemMatch: { status: "success" },
            },
          },
        }),
        Question.distinct("examCode", {
          isMock: true,
          mockTestCode: { $exists: true, $ne: "" },
        }),
        MockQuestion.distinct("examCode", {
          mockTestCode: { $exists: true, $ne: "" },
        }),
        student ? Payment.find({ studentId: student._id, status: "success" }).lean() : [],
      ]);

    const questions = await Question.find({
      $or: [{ isMock: { $exists: false } }, { isMock: false }],
    })
      .select({ examCode: 1, type: 1, parentQuestion: 1, branchKey: 1, options: 1 })
      .lean();

    const countMap = buildExamQuestionStats(questions);
    const mockExamCodeSet = new Set([...(legacyMockCodes || []), ...(mockCodes || [])]);
    const studentExamPaymentMap = buildStudentExamPaymentMap(student);
    const paidCountMap = new Map(
      (paidCountsAgg || []).map((item) => [String(item?._id || "").trim(), Number(item?.total) || 0]),
    );

    // Build payment map from new Payment model
    const paymentMap = new Map();
    (studentPayments || []).forEach((p) => {
      paymentMap.set(String(p.examCode || "").trim(), p);
    });

    const configMap = Object.fromEntries(
      configs.map((c) => [String(c?.examCode || "").trim(), c])
    );

    const examCodes = new Set([
      ...Array.from(countMap.keys()),
      ...configs.map((c) => String(c?.examCode || "").trim()),
    ]);

    const configOrderedCodes = configs
      .map((c) => String(c?.examCode || "").trim())
      .filter(Boolean);
    const configCodeSet = new Set(configOrderedCodes);
    const remainingCodes = Array.from(examCodes)
      .map((code) => String(code || "").trim())
      .filter((code) => code && !configCodeSet.has(code))
      .sort((a, b) => a.localeCompare(b));
    const orderedExamCodes = [...configOrderedCodes, ...remainingCodes];
    const legacyFallbackExamCode = orderedExamCodes[0] || "";

    if (legacyFallbackExamCode && Number(legacyGeneralPaidCount) > 0) {
      const prev = paidCountMap.get(legacyFallbackExamCode) || 0;
      paidCountMap.set(legacyFallbackExamCode, prev + Number(legacyGeneralPaidCount));
    }

    const legacyGeneralPayment =
      student &&
      student.isPaid === true &&
      String(student?.payment?.status || "").toLowerCase() === "success"
        ? {
            paymentId: student?.payment?.paymentId || `legacy-${student?._id || "student"}`,
            amount: Number(student?.payment?.amount) || 0,
            status: "success",
            paidAt: student?.payment?.paidAt || student?.updatedAt || student?.createdAt || new Date(),
          }
        : null;

    let legacyGeneralPaymentConsumed = false;

    const data = orderedExamCodes.map((code) => {
      const c = configMap[code];
      const counts = countMap.get(code) || {
        totalQuestions: 0,
        totalQuestionsAll: 0,
      };

      const paymentRecord = paymentMap.get(code);
      const legacyExamPaymentRecord = studentExamPaymentMap.get(code);

      let effectivePaymentRecord = null;
      if (paymentRecord && String(paymentRecord?.status || "").toLowerCase() === "success") {
        effectivePaymentRecord = paymentRecord;
      } else if (
        legacyExamPaymentRecord &&
        String(legacyExamPaymentRecord?.status || "").toLowerCase() === "success"
      ) {
        effectivePaymentRecord = legacyExamPaymentRecord;
      } else if (
        legacyGeneralPayment &&
        !legacyGeneralPaymentConsumed &&
        legacyFallbackExamCode &&
        code === legacyFallbackExamCode
      ) {
        effectivePaymentRecord = legacyGeneralPayment;
        legacyGeneralPaymentConsumed = true;
      }

      const paymentState = deriveExamPaymentInfo(effectivePaymentRecord, now);

      const examStartAt = toDateOrNull(c?.examStartAt);
      const examEndAt = toDateOrNull(c?.examEndAt);
      const startsOk = !examStartAt || now >= examStartAt.getTime();
      const endsOk = !examEndAt || now <= examEndAt.getTime();
      const isExamWindowActive = startsOk && endsOk;
      const canStartExam =
        paymentState.isStudentPaid &&
        paymentState.isPaymentValidityActive &&
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
        totalRegisteredPaidStudents: paidCountMap.get(code) || 0,
        paymentValidityDays: PAYMENT_VALIDITY_DAYS,
        isStudentPaid: paymentState.isStudentPaid,
        payment: paymentState.payment,
        paymentAvailableFrom: paymentState.paymentAvailableFrom,
        paymentValidTill: paymentState.paymentValidTill,
        isPaymentValidityActive: paymentState.isPaymentValidityActive,
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
module.exports.resolveStudentFromRequest = resolveStudentFromRequest;
