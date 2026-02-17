// यह API roll number से छात्र detail देता है
const Student = require("../../models/Student");

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

module.exports = getStudentByRollNumber;
