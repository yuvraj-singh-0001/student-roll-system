import express from "express";
import addStudent from "../../api/admin/students-Management/addStudent.js";
import getAllStudents from "../../api/admin/students-Management/getAllStudents.js";
import getStudentByRollNumber from "../../api/student/getStudentByRollNumber.js";
import getStudentProfile from "../../api/student/getStudentProfile.js";
import trackEmailOpen from "../../api/student/trackEmailOpen.js";
import updateStudent from "../../api/admin/students-Management/updateStudent.js";
import deleteStudent from "../../api/admin/students-Management/deleteStudent.js";
import registerFormB from "../../api/student/registerFormB.js";
import checkUsername from "../../api/student/checkUsername.js";
import authMiddleware from "../../middlewares/auth.js";

const router = express.Router();

// POST - Add new student
router.post("/add", addStudent);

// GET - Get all students
router.get("/all", getAllStudents);

// GET - Track email open (must be before /:rollNumber to avoid catching it)
router.get("/track/:trackingId", trackEmailOpen);

// POST - Form B submission (requires auth cookie from Form A)
router.post("/form-b", authMiddleware, registerFormB);

// GET - Check username availability (requires auth cookie)
router.get("/check-username", authMiddleware, checkUsername);

// GET - Get student profile (requires auth cookie)
router.get("/profile", authMiddleware, getStudentProfile);

// PUT - Update student by id
router.put("/:id", updateStudent);

// DELETE - Delete student by id
router.delete("/:id", deleteStudent);

// GET - Get student by roll number
router.get("/:rollNumber", getStudentByRollNumber);

export default router;
