const express = require("express");
const getStudentWiseAnalysis = require("../../api/admin/analysis/getStudentWiseAnalysis");
const getQuestionWiseAnalysis = require("../../api/admin/analysis/getQuestionWiseAnalysis");
const getConfidenceWiseAnalysis = require("../../api/admin/analysis/getConfidenceWiseAnalysis");
const getDashboardAnalysis = require("../../api/admin/analysis/getDashboardAnalysis");
const getStudentExamDetails = require("../../api/admin/analysis/getStudentExamDetails");
const getExamQuestionHighlights = require("../../api/admin/analysis/getExamQuestionHighlights");
const getExamStudentResults = require("../../api/admin/analysis/getExamStudentResults");
const getAdminDashboardOverview = require("../../api/admin/analysis/getAdminDashboardOverview");

const router = express.Router();

router.get("/students", getStudentWiseAnalysis);
router.get("/questions", getQuestionWiseAnalysis);
router.get("/confidence", getConfidenceWiseAnalysis);
router.get("/dashboard", getDashboardAnalysis);
router.get("/student-details/:studentId", getStudentExamDetails);
router.get("/exam/question-highlights", getExamQuestionHighlights);
router.get("/exam/student-results", getExamStudentResults);
router.get("/admin/overview", getAdminDashboardOverview);

module.exports = router;
