// backend/controllers/question/index.js
const express = require("express");
const router = express.Router();

const addQuestion = require("../../api/admin/questions/addQuestion");
const getExamQuestions = require("../../api/admin/questions/getExamQuestions");
const getAllQuestions = require("../../api/admin/questions/getAllQuestions");

router.post("/add", addQuestion);
router.get("/all", getAllQuestions);
router.get("/exam", getExamQuestions); // ⭐ OlympiadExamPage yahi hit karega
// future: router.get("/all", ... ) agar chaho to

module.exports = router;
