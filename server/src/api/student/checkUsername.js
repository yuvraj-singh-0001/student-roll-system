const Student = require("../../models/Student");
const Teacher = require("../../models/Teacher");
const Parent = require("../../models/Parent");

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

    const rawUsername = normalizeLower(req.query?.username);
    if (!rawUsername) {
      return res.status(400).json({
        success: false,
        message: "Username is required.",
      });
    }

    const rawRole = normalizeLower(req.query?.role || "student");
    const role = ["student", "teacher", "parent"].includes(rawRole)
      ? rawRole
      : "student";

    let prefix = "@S-";
    if (role === "teacher") prefix = "@T-";
    else if (role === "parent") prefix = "@P-";

    const username = `${prefix}${rawUsername}`;

    let existing = null;

    if (role === "teacher") {
      existing = await Teacher.findOne({
        "formB.account.username": username,
      }).lean();
    } else if (role === "parent") {
      existing = await Parent.findOne({
        "formB.account.username": username,
      }).lean();
    } else {
      existing = await Student.findOne({
        "formB.account.username": username,
        _id: { $ne: studentId },
      }).lean();
    }

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
