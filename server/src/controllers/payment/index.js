const express = require("express");
const  fakePayment  = require("../../api/payment");

const router = express.Router();

// FAKE PAYMENT ROUTE
router.post("/pay", fakePayment);

module.exports = router;
