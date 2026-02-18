const express = require("express");
const addStudent = require("../../api/student/addStudent");
const getAllStudents = require("../../api/student/getAllStudents");
const getStudentByRollNumber = require("../../api/student/getStudentByRollNumber");
const trackEmailOpen = require("../../api/student/trackEmailOpen");
const updateStudent = require("../../api/student/updateStudent");
const deleteStudent = require("../../api/student/deleteStudent");

const router = express.Router();

// POST - Add new student
router.post("/add", addStudent);

// GET - Get all students
router.get("/all", getAllStudents);

// GET - Track email open (must be before /:rollNumber to avoid catching it)
router.get("/track/:trackingId", trackEmailOpen);

// PUT - Update student by id
router.put("/:id", updateStudent);

// DELETE - Delete student by id
router.delete("/:id", deleteStudent);

// GET - Get student by roll number
router.get("/:rollNumber", getStudentByRollNumber);

module.exports = router;
