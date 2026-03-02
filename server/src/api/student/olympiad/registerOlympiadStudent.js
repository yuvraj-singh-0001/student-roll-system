// यह API olympiad के लिए student register करता है
const Student = require("../../../models/Student");
const Payment = require("../../../models/Payment");
const { generateExamStudentId } = require("../../../../utils/rollNumber");

async function registerOlympiadStudent(req, res) {
  try {
    const { name, email, examCode, payment } = req.body;
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
      isPaid: !!payment, // mark as paid if payment provided
      payment: payment ? {
        paymentId: payment.paymentId,
        paidAt: new Date(),
        amount: payment.amount,
        status: "success",
      } : undefined,
    });
    await student.save();

    // If payment provided, store payment record
    if (payment && payment.status === "success" && payment.paymentId) {
      const paymentRecord = new Payment({
        studentId: student._id,
        examCode: String(examCode || "").trim(),
        amount: payment.amount,
        paymentId: payment.paymentId,
        status: "success",
        paidAt: new Date(),
        gateway: payment.gateway || "razorpay",
        metadata: payment.metadata || {},
      });
      await paymentRecord.save();
    }

    return res.status(201).json({
      success: true,
      data: { 
        studentId, 
        name, 
        email,
        examCode: examCode || null,
        paidExam: !!payment && payment.status === "success",
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = registerOlympiadStudent;
