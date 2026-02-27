// backend/models/MockExamAttempt.js
// Separate collection for mock test attempts (practice results)
const mongoose = require("mongoose");

const mockAnswerSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number, required: true },
    questionText: { type: String, required: true },
    type: {
      type: String,
      enum: ["simple", "multiple", "confidence", "branch_parent", "branch_child"],
      required: true,
    },
    parentQuestion: { type: Number },
    branchKey: { type: String, enum: ["A", "B"] },
    options: [
      {
        key: String,
        text: String,
      },
    ],
    selectedAnswer: { type: String, default: null },
    selectedAnswers: [{ type: String }],
    correctAnswer: { type: String, default: null },
    correctAnswers: [{ type: String }],
    confidence: { type: String, enum: ["low", "mid", "high", null], default: null },
    status: {
      type: String,
      enum: ["attempted", "skipped", "not_visited"],
      default: "not_visited",
    },
    marks: { type: Number, default: 0 },
    isCorrect: { type: Boolean, default: null },
    marksReason: { type: String, default: "" },
    firstVisitMs: { type: Number, default: null },
    revisitChangeMs: [{ type: Number }],
    visitDurationsMs: [{ type: Number }],
    totalTimeMs: { type: Number, default: null },
    answerHistory: [{ type: String }],
    answerChangeCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const mockExamAttemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: false,
      trim: true,
    },
    examCode: { type: String, required: true },
    // identify which mock test this attempt belongs to
    mockTestCode: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    autoSubmitted: { type: Boolean, default: false },
    attemptedCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    notVisitedCount: { type: Number, default: 0 },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: null },
    timeTakenSeconds: { type: Number, default: null },
    answers: [mockAnswerSchema],
  },
  {
    timestamps: true,
    collection: "mocktest_results", // explicit collection name as requested
  }
);

mockExamAttemptSchema.index({ studentId: 1, examCode: 1, mockTestCode: 1, createdAt: -1 });
mockExamAttemptSchema.index({ examCode: 1, mockTestCode: 1, createdAt: -1 });
mockExamAttemptSchema.index({ createdAt: -1 });

const MockExamAttempt = mongoose.model("MockExamAttempt", mockExamAttemptSchema);
module.exports = MockExamAttempt;
