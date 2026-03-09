import express from "express";
const router = express.Router();
import paymentSuccess from "../../api/student/payment/paymentSuccess.js";
import payForExam from "../../api/student/payment/payForExam.js";
import debugPayments from "../../api/student/payment/debugPayments.js";
import authMiddleware from "../../middlewares/auth.js";

router.post("/success", authMiddleware, paymentSuccess);
router.post("/pay-for-exam", authMiddleware, payForExam);
router.get("/debug", authMiddleware, debugPayments);

export default router;
