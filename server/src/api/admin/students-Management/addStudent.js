// यह API छात्र जोड़ता है
const Student = require("../../../models/Student");
const generateRollNumber = require("../../../../utils/rollNumber");

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

module.exports = addStudent;
