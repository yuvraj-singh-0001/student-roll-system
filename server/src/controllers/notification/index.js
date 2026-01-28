const express = require("express");
const sendNotification = require("../../api/sendNotification");

const router = express.Router();

router.post("/send", sendNotification);

module.exports = router;
