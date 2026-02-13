// backend/controllers/exam/index.js
const express = require("express");
const router = express.Router();

const submitOlympiad = require("../../api/exam/submitOlympiad");
const { listAttempts, getAttemptDetails } = require("../../api/exam/attempts");
const listExams = require("../../api/exam/listExams");
const { register } = require("../../api/exam");

router.post("/olympiad/submit", submitOlympiad);
router.post("/submit", submitOlympiad);
router.get("/list", listExams);
router.get("/olympiad/attempts", listAttempts);
router.get("/olympiad/attempts/:attemptId", getAttemptDetails);
router.post("/register", register);

module.exports = router;
