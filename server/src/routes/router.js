const express = require("express");
const router = express.Router();
const notificationRoutes = require("../controllers/notification");
const studentRoutes = require("../controllers/student");
const questionRoutes = require("../controllers/question");
const examRoutes = require("../controllers/exam");
const analysisRoutes = require("../controllers/analysis");

router.use("/notification", notificationRoutes);
router.use("/student", studentRoutes);
router.use("/question", questionRoutes);
router.use("/exam", examRoutes);
router.use("/analysis", analysisRoutes);

module.exports = router;
