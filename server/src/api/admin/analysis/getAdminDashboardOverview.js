// यह API admin dashboard के लिए real counts और recent activities देता है
const Student = require("../../../models/Student");
const Question = require("../../../models/Question");
const ExamConfig = require("../../../models/ExamConfig");
const ExamAttempt = require("../../../models/ExamAttempt");
const mongoose = require("mongoose");

const HOURS_24 = 24 * 60 * 60 * 1000;

function toTimeAgo(date) {
  if (!date) return "-";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / (60 * 1000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day ago`;
}

async function getAdminDashboardOverview(req, res) {
  try {
    const since = new Date(Date.now() - HOURS_24);

    const [
      totalStudents,
      totalQuestions,
      examCodesFromConfigs,
      examCodesFromQuestions,
      totalAttempts,
      studentsToday,
      questionsToday,
      examsTodayConfigs,
      examsTodayQuestions,
      attemptsToday,
      avgAgg,
      recentStudents,
      recentAttempts,
    ] = await Promise.all([
      Student.countDocuments(),
      Question.countDocuments({
        $or: [{ isMock: { $exists: false } }, { isMock: false }],
      }),
      ExamConfig.distinct("examCode"),
      Question.distinct("examCode", {
        $or: [{ isMock: { $exists: false } }, { isMock: false }],
      }),
      ExamAttempt.countDocuments(),
      Student.countDocuments({ createdAt: { $gte: since } }),
      Question.countDocuments({
        createdAt: { $gte: since },
        $or: [{ isMock: { $exists: false } }, { isMock: false }],
      }),
      ExamConfig.distinct("examCode", { createdAt: { $gte: since } }),
      Question.distinct("examCode", {
        createdAt: { $gte: since },
        examCode: { $ne: null, $ne: "" },
        $or: [{ isMock: { $exists: false } }, { isMock: false }],
      }),
      ExamAttempt.countDocuments({ createdAt: { $gte: since } }),
      ExamAttempt.aggregate([
        {
          $group: {
            _id: null,
            avgMarks: { $avg: "$totalMarks" },
          },
        },
      ]),
      Student.find().sort({ updatedAt: -1 }).limit(25).lean(),
      ExamAttempt.find().sort({ createdAt: -1 }).limit(15).lean(),
    ]);

    const examCodeSet = new Set([
      ...(examCodesFromConfigs || []).map((c) => String(c || "").trim()),
      ...(examCodesFromQuestions || []).map((c) => String(c || "").trim()),
    ]);
    examCodeSet.delete("");
    const totalExams = examCodeSet.size;

    const avgScore = avgAgg && avgAgg.length ? avgAgg[0].avgMarks : 0;

    const studentActivities = (recentStudents || []).flatMap((s) => {
      const activities = [];
      const studentName =
        s.formB?.verification?.fullName || s.name || "Student";
      const baseId = s._id ? String(s._id) : studentName;
      const createdAt = s.createdAt || s.updatedAt;
      const isExamStudent = String(s.course || "").toLowerCase() === "exam";

      if (createdAt) {
        activities.push({
          id: `${baseId}:register`,
          type: "student",
          user: studentName,
          action: isExamStudent ? "registered for exam" : "submitted Form A",
          time: toTimeAgo(createdAt),
          exam: isExamStudent ? "Exam Registration" : "Form A",
          status: "registered",
          score: null,
          createdAt,
        });
      }

      if (s.payment?.paidAt || s.isPaid) {
        const paidAt = s.payment?.paidAt || s.updatedAt || createdAt;
        if (paidAt) {
          activities.push({
            id: `${baseId}:payment`,
            type: "student",
            user: studentName,
            action: "completed payment",
            time: toTimeAgo(paidAt),
            exam: "Payment",
            status: "completed",
            score: null,
            createdAt: paidAt,
          });
        }
      }

      if (s.formBSubmittedAt || s.formBSubmitted) {
        const formBAt = s.formBSubmittedAt || s.updatedAt || createdAt;
        if (formBAt) {
          activities.push({
            id: `${baseId}:form-b`,
            type: "student",
            user: studentName,
            action: "submitted Form B",
            time: toTimeAgo(formBAt),
            exam: "Form B",
            status: "updated",
            score: null,
            createdAt: formBAt,
          });
        }
      }

      return activities;
    });

    const attemptIds = (recentAttempts || [])
      .map((a) => (a.studentId ? String(a.studentId).trim() : ""))
      .filter((id) => id);
    const uniqueAttemptIds = Array.from(new Set(attemptIds));
    const objectIds = uniqueAttemptIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    const attemptStudents = uniqueAttemptIds.length
      ? await Student.find({
          $or: [
            { rollNumber: { $in: uniqueAttemptIds } },
            ...(objectIds.length ? [{ _id: { $in: objectIds } }] : []),
          ],
        }).lean()
      : [];
    const attemptStudentMap = new Map();
    attemptStudents.forEach((s) => {
      if (s.rollNumber) attemptStudentMap.set(String(s.rollNumber), s);
      if (s._id) attemptStudentMap.set(String(s._id), s);
    });

    const activityAttempts = (recentAttempts || []).map((a) => {
      const rawId = a.studentId ? String(a.studentId).trim() : "";
      const isGuest = !rawId;
      const matchedStudent = rawId ? attemptStudentMap.get(rawId) : null;
      const displayName = isGuest
        ? "Guest"
        : matchedStudent?.formB?.verification?.fullName ||
          matchedStudent?.name ||
          rawId ||
          "Student";
      return {
        id: a._id ? String(a._id) : undefined,
        type: "attempt",
        user: displayName,
        action: "completed exam",
        time: toTimeAgo(a.createdAt),
        exam: a.examCode || "Olympiad",
        status: "completed",
        score: Number.isFinite(a.totalMarks) ? a.totalMarks : null,
        createdAt: a.createdAt,
      };
    });

    const recentActivities = [...studentActivities, ...activityAttempts]
      .sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))
      .slice(0, 20);

    return res.status(200).json({
      success: true,
      data: {
        totals: {
          totalStudents,
          totalQuestions,
          totalExams,
          totalAttempts,
          avgScore,
        },
        today: {
          students: studentsToday,
          questions: questionsToday,
          exams: (() => {
            const set = new Set([
              ...(examsTodayConfigs || []).map((c) => String(c || "").trim()),
              ...(examsTodayQuestions || []).map((c) => String(c || "").trim()),
            ]);
            set.delete("");
            return set.size;
          })(),
          attempts: attemptsToday,
        },
        recentActivities,
        totalActivities: totalStudents + totalAttempts,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = getAdminDashboardOverview;
