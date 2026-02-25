const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  type: { type: String, enum: ['website', 'social'], required: true },
  platform: { type: String }, // Instagram, YouTube आदि (social‑type के लिए)
  page: { type: String }, // वेबसाइट पेज का URL (website‑type के लिए)
  durationMs: { type: Number }, // बिताया गया समय (मिलीसेकंड)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
