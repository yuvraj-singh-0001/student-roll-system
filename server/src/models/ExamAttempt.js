const mongoose = require("mongoose");

const examAttemptSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  questionNumber: { type: Number, required: true },
  selectedAnswer: { type: String, enum: ["A", "B", "C", "D"], default: null },
  confidenceLevel: {
    type: String,
    enum: ["full", "middle", "low"],
    default: null
  },
  status: { type: String, required: true, enum: ["attempted", "skipped"] },
  marks: { type: Number, default: 0 },
  isCorrect: { type: Boolean, default: null }
});

examAttemptSchema.index({ studentId: 1, questionNumber: 1 }, { unique: true });

module.exports = mongoose.model("ExamAttempt", examAttemptSchema);
