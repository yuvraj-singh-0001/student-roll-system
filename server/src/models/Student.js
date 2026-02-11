const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    mobile: {
      type: String,
      required: true
    },

    class: {
      type: String,
      required: true
    },

    formASubmitted: {
      type: Boolean,
      default: true
    },

    isPaid: {
      type: Boolean,
      default: false
    },

    payment: {
      paymentId: String,
      amount: Number,
      status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending"
      },
      paidAt: Date
    }
  },
  { timestamps: true }
);

// 🔥 MAIN FIX: Compound Unique Index
studentSchema.index({ name: 1, mobile: 1 }, { unique: true });

module.exports = mongoose.model("Student", studentSchema);
