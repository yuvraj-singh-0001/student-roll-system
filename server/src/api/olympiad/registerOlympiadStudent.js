// यह API olympiad के लिए student register करता है
const Student = require("../../models/Student");
const { generateExamStudentId } = require("../../../utils/rollNumber");

async function registerOlympiadStudent(req, res) {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email required",
      });
    }
    const count = await Student.countDocuments({ course: "Exam" });
    const studentId = generateExamStudentId(count + 1);
    const student = new Student({
      name,
      email,
      course: "Exam",
      rollNumber: studentId,
    });
    await student.save();
    return res.status(201).json({
      success: true,
      data: { studentId, name, email },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = registerOlympiadStudent;
