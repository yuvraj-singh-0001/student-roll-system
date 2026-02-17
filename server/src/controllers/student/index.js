const express = require("express");
const addStudent = require("../../api/student/addStudent");
const getAllStudents = require("../../api/student/getAllStudents");
const getStudentByRollNumber = require("../../api/student/getStudentByRollNumber");
const trackEmailOpen = require("../../api/student/trackEmailOpen");

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
