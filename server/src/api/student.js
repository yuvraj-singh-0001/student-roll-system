const Student = require("../models/Student");
const generateRollNumber = require("../../utils/rollNumber");

// Add Student API
const addStudent = async (req, res) => {
  try {
    const { name, email, course } = req.body;

    // Validation
    if (!name || !email || !course) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and course are required",
      });
    }

    // Count students in same course to generate roll number
    const studentCount = await Student.countDocuments({ course });
    const rollNumber = generateRollNumber(course, studentCount + 1);

    // Create new student
    const newStudent = new Student({
      name,
      email,
      course,
      rollNumber,
    });

    // Save to MongoDB
    await newStudent.save();

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      data: newStudent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding student",
      error: error.message,
    });
  }
};

// Get All Students API
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message,
    });
  }
};

// Get Student by Roll Number API
const getStudentByRollNumber = async (req, res) => {
  try {
    const student = await Student.findOne({ rollNumber: req.params.rollNumber });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student fetched successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching student",
      error: error.message,
    });
  }
};

// Track Email Open API
const trackEmailOpen = async (req, res) => {
  try {
    const { trackingId } = req.params;
    
    console.log(`🔍 Tracking request received for ID: ${trackingId}`);

    // Update only once - if already opened, don't update again
    const student = await Student.findOne({ trackingId });

    if (!student) {
      console.log(`⚠️ Tracking ID not found: ${trackingId}`);
      // Return a 1x1 transparent pixel even if tracking ID not found
      res.setHeader("Content-Type", "image/gif");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      return res.send(Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"));
    }

    // Only update if not already opened
    if (student.emailStatus !== "opened") {
      student.emailStatus = "opened";
      student.emailOpenedAt = new Date();
      
      // Add to notification history
      if (!student.notificationHistory) {
        student.notificationHistory = [];
      }
      
      student.notificationHistory.push({
        sentAt: student.emailSentAt,
        status: "opened",
        openedAt: new Date()
      });

      await student.save();
      console.log(`✅ Email marked as OPENED: ${student.name} (${student.email}) at ${student.emailOpenedAt.toISOString()}`);
    } else {
      console.log(`ℹ️ Email already opened: ${student.name} (${student.email})`);
    }

    // Return a 1x1 transparent pixel
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Content-Length", 43);
    res.send(Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"));
  } catch (error) {
    console.error("❌ Tracking error:", error.message);
    console.error(error);
    // Still return pixel to avoid breaking emails
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("Content-Length", 43);
    res.send(Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"));
  }
};

module.exports = {
  addStudent,
  getAllStudents,
  getStudentByRollNumber,
  trackEmailOpen,
};
