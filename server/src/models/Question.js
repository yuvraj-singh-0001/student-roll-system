const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true, unique: true },
  questionText: { type: String, required: true },
  options: [
    { key: { type: String, enum: ["A", "B", "C", "D"] }, text: String }
  ],
  correctAnswer: { type: String, required: true, enum: ["A", "B", "C", "D"] }
});

module.exports = mongoose.model("Question", questionSchema);
