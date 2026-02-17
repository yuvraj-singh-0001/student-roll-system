const express = require("express");
const sendNotification = require("../../api/admin/sendNotification");

const router = express.Router();

router.post("/send", sendNotification);

module.exports = router;
