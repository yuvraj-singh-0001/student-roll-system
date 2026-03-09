// backend/controllers/question/index.js
import express from "express";
const router = express.Router();

import addQuestion from "../../api/admin/questions/addQuestion.js";
import getExamQuestions from "../../api/admin/questions/getExamQuestions.js";
import getAllQuestions from "../../api/admin/questions/getAllQuestions.js";
import getExamMocks from "../../api/admin/questions/getExamMocks.js";

router.post("/add", addQuestion);
router.get("/all", getAllQuestions);
router.get("/exam", getExamQuestions); // ⭐ OlympiadExamPage yahi hit karega
router.get("/mocks", getExamMocks); // ⭐ list of mock tests per examCode
// future: router.get("/all", ... ) agar chaho to

export default router;
