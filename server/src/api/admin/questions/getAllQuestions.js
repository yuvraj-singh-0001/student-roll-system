// यह API सभी questions की सूची देता है
const Question = require("../../../models/Question");

async function getAllQuestions(req, res) {
  try {
    const list = await Question.find().sort({ questionNumber: 1 });
    return res.status(200).json({ success: true, data: list });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = getAllQuestions;
