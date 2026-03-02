// backend/models/ExamConfig.js
const mongoose = require("mongoose");

const examConfigSchema = new mongoose.Schema(
  {
    examCode: { type: String, required: true, unique: true, trim: true },
    title: { type: String, trim: true, default: "" },
    totalTimeMinutes: { type: Number, default: 60 },
    registrationPrice: { type: Number, default: 0 },
    examStartAt: { type: Date, default: null },
    examEndAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const ExamConfig = mongoose.model("ExamConfig", examConfigSchema);
module.exports = ExamConfig;
