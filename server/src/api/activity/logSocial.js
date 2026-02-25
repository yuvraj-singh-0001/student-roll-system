const ActivityLog = require('../../models/ActivityLog');

// POST /activity/social
// body: { studentId, platform, durationMs }
module.exports = async (req, res) => {
  try {
    const { studentId, platform, durationMs } = req.body;
    if (!studentId || !platform || typeof durationMs !== 'number') {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const log = await ActivityLog.create({
      student: studentId,
      type: 'social',
      platform,
      durationMs,
    });
    return res.json({ success: true, data: log });
  } catch (err) {
    console.error('logSocial error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
