const mongoose = require("mongoose");

const examInterestSchema = new mongoose.Schema(
  {
    examCode: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

examInterestSchema.index({ examCode: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("ExamInterest", examInterestSchema);
