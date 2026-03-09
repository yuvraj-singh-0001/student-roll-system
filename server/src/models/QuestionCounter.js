// backend/models/QuestionCounter.js
import mongoose from "mongoose";

const questionCounterSchema = new mongoose.Schema(
  {
    examCode: { type: String, required: true, unique: true, index: true },
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const QuestionCounter = mongoose.model("QuestionCounter", questionCounterSchema);
export default QuestionCounter;
