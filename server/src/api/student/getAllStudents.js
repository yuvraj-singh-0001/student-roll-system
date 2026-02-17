// यह API सभी छात्रों की सूची देता है
const Student = require("../../models/Student");

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

module.exports = getAllStudents;
