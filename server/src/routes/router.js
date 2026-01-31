const express = require("express");
const router = express.Router();
const notificationRoutes = require("../controllers/notification");
const studentRoutes = require("../controllers/student");
const questionRoutes = require("../controllers/question");
const examRoutes = require("../controllers/exam");
const analysisRoutes = require("../controllers/analysis");
const authRoutes = require("../controllers/auth");
const paymentRoutes = require("../controllers/payment");

// ✅ REMOVE duplicate auth routes
router.use("/notification", notificationRoutes);
router.use("/student", studentRoutes);
router.use("/question", questionRoutes);
router.use("/exam", examRoutes);
router.use("/analysis", analysisRoutes);
router.use("/auth", authRoutes); // This is enough
router.use("/payment", paymentRoutes);

module.exports = router;