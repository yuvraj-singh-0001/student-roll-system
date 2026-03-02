// यह API payment success handle करता है
const Student = require("../../../models/Student");

const paymentSuccess = async (req, res) => {
  try {
    const { paymentId, amount, examCode } = req.body;
    const studentId = req.user.userId;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const paidAt = new Date();
    const normalizedExamCode = String(examCode || "").trim();
    const safeAmount = Number(amount) || 0;

    student.isPaid = true;
    student.payment = {
      paymentId,
      amount: safeAmount,
      status: "success",
      paidAt,
    };

    if (normalizedExamCode) {
      const existingIndex = Array.isArray(student.examPayments)
        ? student.examPayments.findIndex(
            (entry) => String(entry?.examCode || "").trim() === normalizedExamCode,
          )
        : -1;

      const nextEntry = {
        examCode: normalizedExamCode,
        paymentId,
        amount: safeAmount,
        status: "success",
        paidAt,
      };

      if (!Array.isArray(student.examPayments)) {
        student.examPayments = [nextEntry];
      } else if (existingIndex >= 0) {
        student.examPayments[existingIndex] = {
          ...student.examPayments[existingIndex],
          ...nextEntry,
        };
      } else {
        student.examPayments.push(nextEntry);
      }
    }

    await student.save();

    res.json({
      success: true,
      message: normalizedExamCode
        ? `Payment successful for exam ${normalizedExamCode}.`
        : `Registration successful with payment. Please remember your Name: ${student.name} and Mobile: ${student.mobile}`,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = paymentSuccess;
