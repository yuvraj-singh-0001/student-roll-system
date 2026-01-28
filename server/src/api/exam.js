const Student = require("../models/Student");
const Question = require("../models/Question");
const ExamAttempt = require("../models/ExamAttempt");
const { generateExamStudentId } = require("../../utils/rollNumber");
const { getMarks } = require("../../utils/marksCalculator");

async function register(req, res) {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email required",
      });
    }
    const count = await Student.countDocuments({ course: "Exam" });
    const studentId = generateExamStudentId(count + 1);
    const student = new Student({
      name,
      email,
      course: "Exam",
      rollNumber: studentId,
    });
    await student.save();
    return res.status(201).json({
      success: true,
      data: { studentId, name, email },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function submitExam(req, res) {
  try {
    const { studentId, answers } = req.body;
    if (!studentId || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "studentId and answers array required",
      });
    }
    const student = await Student.findOne({
      course: "Exam",
      rollNumber: studentId,
    });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    const questions = await Question.find().lean();
    const byNum = Object.fromEntries(
      questions.map((q) => [q.questionNumber, q])
    );
    await ExamAttempt.deleteMany({ studentId });

    const toInsert = [];
    for (const a of answers) {
      const q = byNum[a.questionNumber];
      const status = a.status === "skipped" ? "skipped" : "attempted";
      let selectedAnswer = null;
      let confidenceLevel = null;
      let marks = 0;
      let isCorrect = null;
      if (status === "attempted" && q && ["A", "B", "C", "D"].includes(a.selectedAnswer)) {
        selectedAnswer = a.selectedAnswer;
        confidenceLevel = ["full", "middle", "low"].includes(a.confidenceLevel)
          ? a.confidenceLevel
          : "middle";
        isCorrect = selectedAnswer === q.correctAnswer;
        marks = getMarks(isCorrect, confidenceLevel);
      }
      toInsert.push({
        studentId,
        questionNumber: a.questionNumber,
        selectedAnswer,
        confidenceLevel,
        status,
        marks,
        isCorrect,
      });
    }
    await ExamAttempt.insertMany(toInsert);
    const totalMarks = toInsert.reduce((s, x) => s + x.marks, 0);
    return res.status(200).json({
      success: true,
      data: { totalMarks, attempted: toInsert.filter((x) => x.status === "attempted").length, skipped: toInsert.filter((x) => x.status === "skipped").length },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = { register, submitExam };
