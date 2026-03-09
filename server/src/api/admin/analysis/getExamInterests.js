import ExamInterest from "../../../models/ExamInterest.js";
import ExamConfig from "../../../models/ExamConfig.js";

function toDateOrNull(value) {
  if (!value) return null;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function isUpcomingExam(config, nowMs) {
  const start = toDateOrNull(config?.examStartAt);
  if (!start) return false;
  return start.getTime() > nowMs;
}

function getStudentName(student) {
  return (
    student?.formB?.verification?.fullName ||
    student?.name ||
    student?.formB?.account?.username ||
    "Student"
  );
}

function buildStudentPayload(doc) {
  const student = doc?.studentId || {};
  return {
    interestId: doc?._id ? String(doc._id) : "",
    studentId: student?._id ? String(student._id) : "",
    name: getStudentName(student),
    rollNumber: student?.rollNumber || "-",
    email: student?.email || student?.formB?.contact?.email || "-",
    mobile: student?.mobile || student?.formB?.verification?.whatsappNumber || "-",
    username: student?.formB?.account?.username || "-",
    interestedAt: doc?.createdAt || null,
  };
}

async function getExamInterests(req, res) {
  try {
    const scope = String(req.query.scope || "upcoming").toLowerCase();
    const nowMs = Date.now();

    const configs = await ExamConfig.find()
      .sort({ examStartAt: 1, createdAt: -1 })
      .lean();

    const configByCode = new Map();
    const configCodesOrdered = [];
    (configs || []).forEach((config) => {
      const code = String(config?.examCode || "").trim();
      if (!code || configByCode.has(code)) return;
      configByCode.set(code, config);
      configCodesOrdered.push(code);
    });

    const allowedCodes =
      scope === "all"
        ? configCodesOrdered
        : configCodesOrdered.filter((code) =>
            isUpcomingExam(configByCode.get(code), nowMs)
          );

    const interestQuery = allowedCodes.length
      ? { examCode: { $in: allowedCodes } }
      : scope === "all"
      ? {}
      : { examCode: { $in: [] } };

    const interestDocs = await ExamInterest.find(interestQuery)
      .sort({ createdAt: -1 })
      .populate({
        path: "studentId",
        select: "name rollNumber email mobile formB",
      })
      .lean();

    const interestByExam = new Map();
    const uniqueStudentIds = new Set();

    (interestDocs || []).forEach((doc) => {
      const code = String(doc?.examCode || "").trim();
      if (!code) return;
      if (!interestByExam.has(code)) interestByExam.set(code, []);
      const studentPayload = buildStudentPayload(doc);
      interestByExam.get(code).push(studentPayload);
      if (studentPayload.studentId) uniqueStudentIds.add(studentPayload.studentId);
    });

    const mergedCodes = Array.from(
      new Set([...(allowedCodes || []), ...Array.from(interestByExam.keys())])
    );

    const exams = mergedCodes.map((code) => {
      const config = configByCode.get(code) || null;
      const students = interestByExam.get(code) || [];
      return {
        examCode: code,
        title: config?.title || code,
        examStartAt: config?.examStartAt || null,
        examEndAt: config?.examEndAt || null,
        interestedCount: students.length,
        students,
        lastInterestAt: students.length ? students[0].interestedAt : null,
      };
    });

    exams.sort((a, b) => {
      const aStart = a.examStartAt ? new Date(a.examStartAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bStart = b.examStartAt ? new Date(b.examStartAt).getTime() : Number.MAX_SAFE_INTEGER;
      if (aStart !== bStart) return aStart - bStart;
      return b.interestedCount - a.interestedCount;
    });

    return res.status(200).json({
      success: true,
      data: {
        scope,
        exams,
        totals: {
          exams: exams.length,
          totalInterests: (interestDocs || []).length,
          uniqueStudents: uniqueStudentIds.size,
        },
      },
    });
  } catch (error) {
    console.error("getExamInterests error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export default getExamInterests;