import express from "express";
const router = express.Router();
import notificationRoutes from "../controllers/notification/index.js";
import studentRoutes from "../controllers/student/index.js";
import questionRoutes from "../controllers/question/index.js";
import olympiadRoutes from "../controllers/olympiad/index.js";
import analysisRoutes from "../controllers/analysis/index.js";
import authRoutes from "../controllers/auth/index.js";
import paymentRoutes from "../controllers/payment/index.js";
import activityRoutes from "../controllers/activity/index.js";


router.use("/notification", notificationRoutes);
router.use("/student", studentRoutes);
router.use("/question", questionRoutes);
router.use("/olympiad", olympiadRoutes);
router.use("/analysis", analysisRoutes);
router.use("/auth", authRoutes); // This is enough
router.use("/payment", paymentRoutes);
router.use("/activity", activityRoutes);

export default router;
