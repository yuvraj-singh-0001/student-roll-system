// backend/controllers/olympiad/olympiadRoutes.js
const express = require("express");
const router = express.Router();

const submitOlympiadExam = require("../../api/student/olympiad/submitOlympiadExam");
const submitMockExam = require("../../api/student/olympiad/submitMockExam");
const { listOlympiadAttempts, getOlympiadAttemptDetails } = require("../../api/student/olympiad/olympiadAttempts");
const listOlympiadExams = require("../../api/student/olympiad/listOlympiadExams");
const registerOlympiadStudent = require("../../api/student/olympiad/registerOlympiadStudent");

// Debug route to check exam configs
router.get("/debug-configs", async (req, res) => {
  try {
    const ExamConfig = require("../../models/ExamConfig");
    const configs = await ExamConfig.find().lean();
    return res.status(200).json({
      success: true,
      data: {
        totalConfigs: configs.length,
        configs: configs.map(c => ({
          examCode: c.examCode,
          title: c.title,
          registrationPrice: c.registrationPrice,
          totalTimeMinutes: c.totalTimeMinutes,
          createdAt: c.createdAt
        }))
      }
    });
  } catch (err) {
    console.error("Debug configs error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/submit", submitOlympiadExam); // real exam submit
router.post("/mock/submit", submitMockExam); // mock test submit (saved in mocktest_results)
router.get("/list", listOlympiadExams);
router.get("/attempts", listOlympiadAttempts);
router.get("/attempts/:attemptId", getOlympiadAttemptDetails);
router.post("/register", registerOlympiadStudent);

module.exports = router;
