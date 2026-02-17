const express = require("express");
const router = express.Router();
const paymentSuccess = require("../../api/payment/paymentSuccess");
const authMiddleware = require("../../middlewares/auth");

router.post("/success", authMiddleware, paymentSuccess);

module.exports = router;
