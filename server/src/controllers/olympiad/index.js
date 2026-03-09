import express from "express";
const router = express.Router();

import submitOlympiadExam from "../../api/student/olympiad/submitOlympiadExam.js";
import submitMockExam from "../../api/student/olympiad/submitMockExam.js";
import { listOlympiadAttempts, getOlympiadAttemptDetails } from "../../api/student/olympiad/olympiadAttempts.js";
import listOlympiadExams from "../../api/student/olympiad/listOlympiadExams.js";
import registerOlympiadStudent from "../../api/student/olympiad/registerOlympiadStudent.js";
import markExamInterested from "../../api/student/olympiad/markExamInterested.js";
import ExamConfig from "../../models/ExamConfig.js";

// Debug route to check exam configs
router.get("/debug-configs", async (req, res) => {
  try {
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
router.post("/interested", markExamInterested);

export default router;
