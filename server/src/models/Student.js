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

    formBSubmitted: {
      type: Boolean,
      default: false
    },

    formBSubmittedAt: {
      type: Date
    },

    formB: {
      verification: {
        fullName: { type: String, trim: true },
        whatsappNumber: { type: String, trim: true }
      },
      account: {
        username: { type: String, trim: true, lowercase: true },
        passwordHash: { type: String }
      },
      contact: {
        email: { type: String, trim: true, lowercase: true },
        dob: { type: Date },
        country: { type: String, trim: true },
        state: { type: String, trim: true },
        district: { type: String, trim: true },
        pinCode: { type: String, trim: true },
        gender: { type: String, trim: true },
        address: { type: String, trim: true }
      },
      school: {
        country: { type: String, trim: true },
        name: { type: String, trim: true },
        state: { type: String, trim: true },
        district: { type: String, trim: true },
        pinCode: { type: String, trim: true }
      },
      parents: {
        father: {
          name: { type: String, trim: true },
          phone: { type: String, trim: true },
          email: { type: String, trim: true, lowercase: true },
          profession: { type: String, trim: true }
        },
        mother: {
          name: { type: String, trim: true },
          phone: { type: String, trim: true },
          email: { type: String, trim: true, lowercase: true },
          profession: { type: String, trim: true }
        }
      },
      siblings: {
        count: { type: Number, default: 0 },
        details: [
          {
            name: { type: String, trim: true },
            age: { type: String, trim: true },
            class: { type: String, trim: true }
          }
        ]
      },
      social: {
        followed: { type: Boolean, default: false },
        followedAt: { type: Date }
      }
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
studentSchema.index({ "formB.account.username": 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Student", studentSchema);
