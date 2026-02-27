// backend/controllers/olympiad/olympiadRoutes.js
const express = require("express");
const router = express.Router();

const submitOlympiadExam = require("../../api/student/olympiad/submitOlympiadExam");
const submitMockExam = require("../../api/student/olympiad/submitMockExam");
const { listOlympiadAttempts, getOlympiadAttemptDetails } = require("../../api/student/olympiad/olympiadAttempts");
const listOlympiadExams = require("../../api/student/olympiad/listOlympiadExams");
const registerOlympiadStudent = require("../../api/student/olympiad/registerOlympiadStudent");

router.post("/submit", submitOlympiadExam); // real exam submit
router.post("/mock/submit", submitMockExam); // mock test submit (saved in mocktest_results)
router.get("/list", listOlympiadExams);
router.get("/attempts", listOlympiadAttempts);
router.get("/attempts/:attemptId", getOlympiadAttemptDetails);
router.post("/register", registerOlympiadStudent);

module.exports = router;
