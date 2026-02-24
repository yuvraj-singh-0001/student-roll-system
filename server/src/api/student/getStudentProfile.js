const Student = require("../../models/Student");
const User = require("../../models/User");

const buildProfile = (student = {}) => ({
  studentId: student._id ? String(student._id) : "",
  name:
    student.formB?.verification?.fullName ||
    student.name ||
    "",
  className: student.class || "",
  username: student.formB?.account?.username || "",
  email:
    student.formB?.contact?.email ||
    student.email ||
    "",
  rollNumber: student.rollNumber || "",
});

const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    let student = await Student.findById(userId).lean();
    if (student) {
      return res.status(200).json({
        success: true,
        data: buildProfile(student),
      });
    }

    const user = await User.findById(userId).lean();
    if (user?.email) {
      student = await Student.findOne({
        $or: [
          { email: user.email },
          { "formB.contact.email": user.email },
        ],
      }).lean();
    }

    if (student) {
      return res.status(200).json({
        success: true,
        data: buildProfile(student),
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        studentId: userId || "",
        name: user?.name || "",
        className: "",
        username: "",
        email: user?.email || "",
        rollNumber: "",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load profile",
      error: error.message,
    });
  }
};

module.exports = getStudentProfile;
