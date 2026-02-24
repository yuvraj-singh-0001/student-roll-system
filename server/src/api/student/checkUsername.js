const Student = require("../../models/Student");

const normalizeLower = (value) => String(value || "").trim().toLowerCase();

const checkUsername = async (req, res) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Login required",
      });
    }

    const username = normalizeLower(req.query?.username);
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required.",
      });
    }

    const existing = await Student.findOne({
      "formB.account.username": username,
      _id: { $ne: studentId },
    }).lean();

    return res.status(200).json({
      success: true,
      available: !existing,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to check username right now.",
    });
  }
};

module.exports = checkUsername;
