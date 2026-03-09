import Student from "../../../models/Student.js";

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: student
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting student",
      error: error.message
    });
  }
};

export default deleteStudent;
