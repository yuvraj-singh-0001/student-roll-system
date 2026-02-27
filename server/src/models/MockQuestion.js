// models/MockQuestion.js
const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true, // "A", "B", "C", "D"
      enum: ["A", "B", "C", "D"],
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const mockQuestionSchema = new mongoose.Schema(
  {
    examCode: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    mockTestCode: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    mockTitle: {
      type: String,
      trim: true,
    },
    mockTime: {
      type: Number,
    },

    questionNumber: {
      type: Number,
      required: true,
    },

    // "simple" | "multiple" | "confidence" | "branch_parent" | "branch_child"
    type: {
      type: String,
      required: true,
      enum: ["simple", "multiple", "confidence", "branch_parent", "branch_child"],
    },

    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [optionSchema],
      validate: {
        validator: function (val) {
          if (!val) return false;
          if (this.type === "branch_parent") return val.length === 2;
          return val.length === 4;
        },
        message: "Exactly 4 options required (2 for branch_parent).",
      },
    },

    // For simple + confidence + branch_child
    correctAnswer: {
      type: String, // "A" | "B" | "C" | "D"
      enum: ["A", "B", "C", "D"],
    },

    // For multiple
    correctAnswers: [
      {
        type: String,
        enum: ["A", "B", "C", "D"],
      },
    ],

    // Confidence questions flag
    confidenceRequired: {
      type: Boolean,
      default: false,
    },

    // For branching
    parentQuestion: {
      type: Number, // questionNumber of parent branch question
    },
    branchKey: {
      type: String, // "A" or "B"
      enum: ["A", "B"],
    },
  },
  { timestamps: true }
);

// unique examCode + mockTestCode + questionNumber (separate numbering for each mock)
mockQuestionSchema.index(
  { examCode: 1, mockTestCode: 1, questionNumber: 1 },
  { unique: true }
);

const MockQuestion = mongoose.model("MockQuestion", mockQuestionSchema);
module.exports = MockQuestion;
