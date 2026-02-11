const Student = require("../../models/Student");
const jwt = require("jsonwebtoken");

const registerFormA = async (req, res) => {
  try {
    let { name, mobile, class: studentClass } = req.body;

    /* ===============================
       1. VALIDATION
    =============================== */

    if (!name || !mobile || !studentClass) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile number, and class are required."
      });
    }

    // Normalize name (important)
    name = name.trim().toLowerCase();
    mobile = mobile.trim();

    /* ===============================
       2. CHECK DUPLICATE (name + mobile)
    =============================== */

    const existingStudent = await Student.findOne({
      name,
      mobile
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message:
          "A student with this name and mobile number is already registered. Please check your details or proceed to payment if already registered."
      });
    }

    /* ===============================
       3. CREATE STUDENT
    =============================== */

    const student = await Student.create({
      name,
      mobile,
      class: studentClass,
      formASubmitted: true
    });

    /* ===============================
       4. GENERATE JWT TOKEN
    =============================== */

    const token = jwt.sign(
      { userId: student._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax"
    });

    /* ===============================
       5. SUCCESS RESPONSE
    =============================== */

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Your Form A has been submitted. Please proceed to complete your payment to confirm your participation.",
      student: {
        id: student._id,
        name: student.name,
        mobile: student.mobile,
        class: student.class,
        isPaid: student.isPaid
      }
    });

  } catch (error) {

    // Mongo duplicate index error safeguard
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Duplicate registration detected. The same name and mobile number combination already exists."
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "An unexpected server error occurred. Please try again later."
    });
  }
};

module.exports = registerFormA;
