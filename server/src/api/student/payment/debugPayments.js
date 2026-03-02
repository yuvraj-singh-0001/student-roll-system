const Payment = require("../../../models/Payment");
const Student = require("../../../models/Student");
const { resolveStudentFromRequest } = require("../olympiad/listOlympiadExams");

async function debugPayments(req, res) {
  try {
    const student = await resolveStudentFromRequest(req);
    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Student not found or not authenticated",
      });
    }

    // Get all payments for this student
    const payments = await Payment.find({ studentId: student._id }).lean();
    
    // Get student's legacy payment info
    const studentDoc = await Student.findById(student._id).lean();
    
    return res.status(200).json({
      success: true,
      data: {
        student: {
          _id: student._id,
          email: student.email,
          name: student.name,
        },
        newPayments: payments,
        legacyPayments: studentDoc?.examPayments || [],
        totalNewPayments: payments.length,
        totalLegacyPayments: (studentDoc?.examPayments || []).length,
      },
    });
  } catch (err) {
    console.error("debugPayments error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = debugPayments;
