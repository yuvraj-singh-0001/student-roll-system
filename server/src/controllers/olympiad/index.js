// backend/controllers/olympiad/olympiadRoutes.js
const express = require("express");
const router = express.Router();

const submitOlympiadExam = require("../../api/student/olympiad/submitOlympiadExam");
const { listOlympiadAttempts, getOlympiadAttemptDetails } = require("../../api/student/olympiad/olympiadAttempts");
const listOlympiadExams = require("../../api/student/olympiad/listOlympiadExams");
const registerOlympiadStudent = require("../../api/student/olympiad/registerOlympiadStudent");

router.post("/submit", submitOlympiadExam);
router.get("/list", listOlympiadExams);
router.get("/attempts", listOlympiadAttempts);
router.get("/attempts/:attemptId", getOlympiadAttemptDetails);
router.post("/register", registerOlympiadStudent);

module.exports = router;
