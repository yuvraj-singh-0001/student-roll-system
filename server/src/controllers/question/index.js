const express = require("express");
const {
  addQuestion,
  bulkAddQuestions,
  getAllQuestions,
  getExamQuestions,
} = require("../../api/question");

const router = express.Router();

router.post("/add", addQuestion);
router.post("/bulk-add", bulkAddQuestions);
router.get("/all", getAllQuestions);
router.get("/exam", getExamQuestions);

module.exports = router;
