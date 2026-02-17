// यह API admin dashboard के लिए real counts और recent activities देता है
const Student = require("../../../models/Student");
const Question = require("../../../models/Question");
const ExamConfig = require("../../../models/ExamConfig");
const ExamAttempt = require("../../../models/ExamAttempt");

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
      Question.countDocuments(),
      ExamConfig.distinct("examCode"),
      Question.distinct("examCode"),
      ExamAttempt.countDocuments(),
      Student.countDocuments({ createdAt: { $gte: since } }),
      Question.countDocuments({ createdAt: { $gte: since } }),
      ExamConfig.distinct("examCode", { createdAt: { $gte: since } }),
      Question.distinct("examCode", {
        createdAt: { $gte: since },
        examCode: { $ne: null, $ne: "" },
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
      Student.find().sort({ createdAt: -1 }).limit(15).lean(),
      ExamAttempt.find().sort({ createdAt: -1 }).limit(15).lean(),
    ]);

    const examCodeSet = new Set([
      ...(examCodesFromConfigs || []).map((c) => String(c || "").trim()),
      ...(examCodesFromQuestions || []).map((c) => String(c || "").trim()),
    ]);
    examCodeSet.delete("");
    const totalExams = examCodeSet.size;

    const avgScore = avgAgg && avgAgg.length ? avgAgg[0].avgMarks : 0;

    const activityStudents = (recentStudents || []).map((s) => ({
      id: s._id ? String(s._id) : undefined,
      type: "student",
      user: s.name || "Student",
      action: "registered",
      time: toTimeAgo(s.createdAt),
      exam: "Student Registration",
      status: "registered",
      score: null,
      createdAt: s.createdAt,
    }));

    const activityAttempts = (recentAttempts || []).map((a) => ({
      id: a._id ? String(a._id) : undefined,
      type: "attempt",
      user: a.studentId || "Student",
      action: "completed exam",
      time: toTimeAgo(a.createdAt),
      exam: a.examCode || "Olympiad",
      status: "completed",
      score: Number.isFinite(a.totalMarks) ? a.totalMarks : null,
      createdAt: a.createdAt,
    }));

    const recentActivities = [...activityStudents, ...activityAttempts]
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
