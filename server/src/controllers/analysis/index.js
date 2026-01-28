const express = require("express");
const { studentWise, questionWise, confidenceWise, dashboard } = require("../../api/analysis");

const router = express.Router();

router.get("/students", studentWise);
router.get("/questions", questionWise);
router.get("/confidence", confidenceWise);
router.get("/dashboard", dashboard);

module.exports = router;
