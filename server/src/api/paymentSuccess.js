const Student = require("../models/Student");

const paymentSuccess = async (req, res) => {
  try {
    const { paymentId, amount } = req.body;
    const studentId = req.user.userId;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    student.isPaid = true;
    student.payment = {
      paymentId,
      amount,
      status: "success",
      paidAt: new Date()
    };

    await student.save();

    res.json({
      success: true,
      message: `Registration successful with payment. Please remember your Name: ${student.name} and Mobile: ${student.mobile}`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = paymentSuccess;
