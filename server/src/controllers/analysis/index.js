const express = require("express");
const { studentWise, questionWise, confidenceWise, dashboard, studentExamDetails } = require("../../api/analysis");

const router = express.Router();

router.get("/students", studentWise);
router.get("/questions", questionWise);
router.get("/confidence", confidenceWise);
router.get("/dashboard", dashboard);
router.get("/student-details/:studentId", studentExamDetails);

module.exports = router;
