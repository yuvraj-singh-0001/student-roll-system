import express from "express";
import getStudentWiseAnalysis from "../../api/admin/analysis/getStudentWiseAnalysis.js";
import getQuestionWiseAnalysis from "../../api/admin/analysis/getQuestionWiseAnalysis.js";
import getConfidenceWiseAnalysis from "../../api/admin/analysis/getConfidenceWiseAnalysis.js";
import getDashboardAnalysis from "../../api/admin/analysis/getDashboardAnalysis.js";
import getStudentExamDetails from "../../api/admin/analysis/getStudentExamDetails.js";
import getExamQuestionHighlights from "../../api/admin/analysis/getExamQuestionHighlights.js";
import getExamStudentResults from "../../api/admin/analysis/getExamStudentResults.js";
import getAdminDashboardOverview from "../../api/admin/analysis/getAdminDashboardOverview.js";
import getExamInterests from "../../api/admin/analysis/getExamInterests.js";

const router = express.Router();

router.get("/students", getStudentWiseAnalysis);
router.get("/questions", getQuestionWiseAnalysis);
router.get("/confidence", getConfidenceWiseAnalysis);
router.get("/dashboard", getDashboardAnalysis);
router.get("/student-details/:studentId", getStudentExamDetails);
router.get("/exam/question-highlights", getExamQuestionHighlights);
router.get("/exam/student-results", getExamStudentResults);
router.get("/exam/interests", getExamInterests);
router.get("/admin/overview", getAdminDashboardOverview);

export default router;
