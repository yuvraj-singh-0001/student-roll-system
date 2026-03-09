import mongoose from "mongoose";
// Define the ExamInterest schema to stored the students who are interested in a particular exam. This will help us to send notifications to the students when the exam is scheduled or updated.

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

export default mongoose.model("ExamInterest", examInterestSchema);
