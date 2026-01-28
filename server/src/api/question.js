const Question = require("../models/Question");

async function addQuestion(req, res) {
  try {
    const { questionNumber, questionText, options, correctAnswer } = req.body;
    if (!questionNumber || !questionText || !options?.length || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: "questionNumber, questionText, options, correctAnswer required",
      });
    }
    const q = new Question({
      questionNumber: Number(questionNumber),
      questionText,
      options: options.map((o) => ({ key: o.key, text: o.text })),
      correctAnswer,
    });
    await q.save();
    return res.status(201).json({ success: true, data: q });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function bulkAddQuestions(req, res) {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions) || !questions.length) {
      return res.status(400).json({
        success: false,
        message: "questions array required",
      });
    }
    const inserted = [];
    for (const q of questions) {
      const doc = new Question({
        questionNumber: Number(q.questionNumber),
        questionText: q.questionText,
        options: (q.options || []).map((o) => ({ key: o.key, text: o.text })),
        correctAnswer: q.correctAnswer,
      });
      await doc.save();
      inserted.push(doc);
    }
    return res.status(201).json({ success: true, data: inserted, count: inserted.length });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function getAllQuestions(req, res) {
  try {
    const list = await Question.find().sort({ questionNumber: 1 });
    return res.status(200).json({ success: true, data: list });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function getExamQuestions(req, res) {
  try {
    const list = await Question.find()
      .sort({ questionNumber: 1 })
      .select("-correctAnswer")
      .lean();
    return res.status(200).json({ success: true, data: list });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = {
  addQuestion,
  bulkAddQuestions,
  getAllQuestions,
  getExamQuestions,
};
