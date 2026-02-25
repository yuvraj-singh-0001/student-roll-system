const ActivityLog = require('../../models/ActivityLog');

// POST /activity/website
// body: { studentId, page, durationMs }
module.exports = async (req, res) => {
  try {
    const { studentId, page, durationMs } = req.body;
    if (!studentId || !page || typeof durationMs !== 'number') {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const log = await ActivityLog.create({
      student: studentId,
      type: 'website',
      page,
      durationMs,
    });
    return res.json({ success: true, data: log });
  } catch (err) {
    console.error('logWebsite error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
