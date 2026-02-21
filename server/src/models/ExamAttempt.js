// backend/models/ExamAttempt.js
const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number, required: true },
    questionText: { type: String, required: true },
    type: {
      type: String,
      enum: ["simple", "multiple", "confidence", "branch_parent", "branch_child"],
      required: true,
    },
    // branch metadata (optional)
    parentQuestion: { type: Number },
    branchKey: { type: String, enum: ["A", "B"] },
    options: [
      {
        key: String,
        text: String,
      },
    ],

    // student selection
    selectedAnswer: { type: String, default: null }, // simple / confidence / branch
    selectedAnswers: [{ type: String }], // multiple

    // correct
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

    // timing + history tracking
    firstVisitMs: { type: Number, default: null },
    revisitChangeMs: [{ type: Number }],
    visitDurationsMs: [{ type: Number }],
    totalTimeMs: { type: Number, default: null },
    answerHistory: [{ type: String }],
    answerChangeCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const examAttemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: String, // roll number / student id string
      required: false, // abhi optional rakh rahe, baad me required kar sakte ho
      trim: true,
    },

    examCode: { type: String, required: true },

    totalMarks: { type: Number, required: true },

    autoSubmitted: { type: Boolean, default: false },

    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: null },
    timeTakenSeconds: { type: Number, default: null },

    // saare questions + unke attempts
    answers: [answerSchema],
  },
  { timestamps: true }
);

const ExamAttempt = mongoose.model("ExamAttempt", examAttemptSchema);
module.exports = ExamAttempt;
