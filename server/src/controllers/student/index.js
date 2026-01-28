const express = require("express");
const { addStudent, getAllStudents, getStudentByRollNumber, trackEmailOpen } = require("../../api/student");

const router = express.Router();

// POST - Add new student
router.post("/add", addStudent);

// GET - Get all students
router.get("/all", getAllStudents);

// GET - Track email open (must be before /:rollNumber to avoid catching it)
router.get("/track/:trackingId", trackEmailOpen);

// GET - Get student by roll number
router.get("/:rollNumber", getStudentByRollNumber);

module.exports = router;
