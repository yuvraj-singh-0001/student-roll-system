import express from "express";
import sendNotification from "../../api/admin/notification/sendNotification.js";

const router = express.Router();

router.post("/send", sendNotification);

export default router;
