// models/Question.js
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

const questionSchema = new mongoose.Schema(
  {
    examCode: {
      type: String,
      required: true,
      index: true,
      trim: true,
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

// unique examCode + questionNumber (no duplicate numbers in same exam)
questionSchema.index({ examCode: 1, questionNumber: 1 }, { unique: true });

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
