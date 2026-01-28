const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  course: String,
  rollNumber: String,
  emailStatus: {
    type: String,
    enum: ["pending", "sent", "opened", "bounced"],
    default: "pending"
  },
  emailSentAt: Date,
  emailOpenedAt: Date,
  trackingId: String,
  notificationHistory: [{
    sentAt: Date,
    status: String,
    openedAt: Date
  }]
});

module.exports = mongoose.model("Student", studentSchema);
