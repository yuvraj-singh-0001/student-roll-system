const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true
    },

    course: {
      type: String,
      trim: true
    },

    rollNumber: {
      type: String,
      trim: true
    },

    mobile: {
      type: String,
      trim: true
    },

    class: {
      type: String,
      trim: true
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
    },

    trackingId: {
      type: String
    },

    emailStatus: {
      type: String,
      enum: ["pending", "sent", "opened", "bounced"],
      default: "pending"
    },

    emailSentAt: {
      type: Date
    },

    emailOpenedAt: {
      type: Date
    },

    notificationHistory: [
      {
        sentAt: Date,
        openedAt: Date,
        status: String
      }
    ]
  },
  { timestamps: true }
);

studentSchema.index({ name: 1, mobile: 1 }, { unique: true });

module.exports = mongoose.model("Student", studentSchema);
