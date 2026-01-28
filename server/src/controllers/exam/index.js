const express = require("express");
const { register, submitExam } = require("../../api/exam");

const router = express.Router();

router.post("/register", register);
router.post("/submit", submitExam);

module.exports = router;
