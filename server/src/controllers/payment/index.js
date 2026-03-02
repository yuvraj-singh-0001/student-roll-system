const express = require("express");
const router = express.Router();
const paymentSuccess = require("../../api/student/payment/paymentSuccess");
const payForExam = require("../../api/student/payment/payForExam");
const debugPayments = require("../../api/student/payment/debugPayments");
const authMiddleware = require("../../middlewares/auth");

router.post("/success", authMiddleware, paymentSuccess);
router.post("/pay-for-exam", authMiddleware, payForExam);
router.get("/debug", authMiddleware, debugPayments);

module.exports = router;
