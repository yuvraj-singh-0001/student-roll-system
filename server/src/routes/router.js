const express = require("express");
const router = express.Router();
const notificationRoutes = require("../controllers/notification");
const studentRoutes = require("../controllers/student");

// Use notification routes
router.use("/notification", notificationRoutes);

// Use student routes
router.use("/student", studentRoutes);

module.exports = router;
