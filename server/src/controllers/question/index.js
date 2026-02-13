// backend/controllers/question/index.js
const express = require("express");
const router = express.Router();

const addQuestion = require("../../api/admin/questions/addQuestions");
const getExamQuestions = require("../../api/admin/questions/getquestion");
const { bulkAddQuestions, getAllQuestions } = require("../../api/question");

router.post("/add", addQuestion);
router.post("/bulk-add", bulkAddQuestions);
router.get("/all", getAllQuestions);
router.get("/exam", getExamQuestions); // ⭐ OlympiadExamPage yahi hit karega
// future: router.get("/all", ... ) agar chaho to

module.exports = router;
