const Payment = require("../../../models/Payment");
const Student = require("../../../models/Student");
const ExamConfig = require("../../../models/ExamConfig");
const { resolveStudentFromRequest } = require("../olympiad/listOlympiadExams");

async function payForExam(req, res) {
  try {
    const { examCode, paymentId, amount, gateway = "razorpay" } = req.body;
    if (!examCode || !paymentId || !amount) {
      return res.status(400).json({
        success: false,
        message: "examCode, paymentId, and amount are required",
      });
    }

    const student = await resolveStudentFromRequest(req);
    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Student not found or not authenticated",
      });
    }

    // Check if exam exists
    const examConfig = await ExamConfig.findOne({ examCode });
    if (!examConfig) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Check if already paid for this exam
    const existingPayment = await Payment.findOne({
      studentId: student._id,
      examCode,
      status: "success",
    });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Already paid for this exam",
        data: {
          paymentId: existingPayment.paymentId,
          paidAt: existingPayment.paidAt,
        },
      });
    }

    // Create payment record
    const payment = new Payment({
      studentId: student._id,
      examCode: String(examCode).trim(),
      amount: Number(amount),
      paymentId: String(paymentId).trim(),
      status: "success",
      paidAt: new Date(),
      gateway,
      metadata: {
        source: "dashboard",
      },
    });
    await payment.save();

    // Optionally update student's legacy payment array for backward compatibility
    await Student.findByIdAndUpdate(student._id, {
      $push: {
        examPayments: {
          examCode,
          paymentId: payment.paymentId,
          amount: payment.amount,
          status: "success",
          paidAt: payment.paidAt,
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Payment successful",
      data: {
        examCode,
        paymentId: payment.paymentId,
        amount: payment.amount,
        paidAt: payment.paidAt.toISOString(),
        status: "success",
      },
    });
  } catch (err) {
    console.error("payForExam error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = payForExam;
