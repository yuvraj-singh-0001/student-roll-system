// backend/controllers/olympiad/olympiadRoutes.js
const express = require("express");
const router = express.Router();

const submitOlympiadExam = require("../../api/olympiad/submitOlympiadExam");
const { listOlympiadAttempts, getOlympiadAttemptDetails } = require("../../api/olympiad/olympiadAttempts");
const listOlympiadExams = require("../../api/olympiad/listOlympiadExams");
const registerOlympiadStudent = require("../../api/olympiad/registerOlympiadStudent");

router.post("/submit", submitOlympiadExam);
router.get("/list", listOlympiadExams);
router.get("/attempts", listOlympiadAttempts);
router.get("/attempts/:attemptId", getOlympiadAttemptDetails);
router.post("/register", registerOlympiadStudent);

module.exports = router;
