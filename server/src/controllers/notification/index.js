const express = require("express");
const sendNotification = require("../../api/admin/notification/sendNotification");

const router = express.Router();

router.post("/send", sendNotification);

module.exports = router;
