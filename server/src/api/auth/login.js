// यह API user login करता है
const User = require("../../models/User");
const Student = require("../../models/Student");
const Teacher = require("../../models/Teacher");
const Parent = require("../../models/Parent");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    let passwordHash = user ? user.password : null;
    let role = user ? user.role : null;

    if (!user) {
      user = await Student.findOne({ "formB.account.username": String(email).toLowerCase() }) || await Student.findOne({ email });
      if (user) {
        passwordHash = user.formB?.account?.passwordHash;
        role = user.role || "Student";
      }
    }

    if (!user) {
      user = await Teacher.findOne({ "formB.account.username": String(email).toLowerCase() }) || await Teacher.findOne({ email });
      if (user) {
        passwordHash = user.formB?.account?.passwordHash;
        role = user.role || "Teacher";
      }
    }

    if (!user) {
      user = await Parent.findOne({ "formB.account.username": String(email).toLowerCase() }) || await Parent.findOne({ email });
      if (user) {
        passwordHash = user.formB?.account?.passwordHash;
        role = user.role || "Parent";
      }
    }

    if (!user || !passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isSecure =
      req.secure || req.headers["x-forwarded-proto"] === "https";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPaid: user.isPaid,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

module.exports = login;
