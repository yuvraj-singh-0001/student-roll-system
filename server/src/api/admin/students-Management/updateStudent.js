const Student = require("../../../models/Student");

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    const fields = ["name", "email", "course", "rollNumber", "mobile", "class"];

    fields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        const value = req.body[field];
        updates[field] =
          typeof value === "string" ? value.trim() : value;
      }
    });

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update"
      });
    }

    const student = await Student.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate student detected"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error updating student",
      error: error.message
    });
  }
};

module.exports = updateStudent;
