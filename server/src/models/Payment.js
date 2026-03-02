const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    examCode: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentId: {
      type: String, // from payment gateway
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paidAt: {
      type: Date,
    },
    gateway: {
      type: String, // e.g., "razorpay", "stripe"
      default: "razorpay",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // any extra data from gateway
    },
  },
  { timestamps: true }
);

// Compound index for quick lookups
paymentSchema.index({ studentId: 1, examCode: 1 }, { unique: true });

module.exports = mongoose.model("Payment", paymentSchema);
