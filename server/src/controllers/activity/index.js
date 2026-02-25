const ActivityLog = require('../../models/ActivityLog');

// POST /activity/social
// body: { studentId, platform, durationMs }
exports.logSocial = async (req, res) => {
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

// POST /activity/website
// body: { studentId, page, durationMs }
exports.logWebsite = async (req, res) => {
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

// GET /activity/summary/:studentId
exports.getSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const logs = await ActivityLog.find({ student: studentId });
    const socialTotal = logs
      .filter(l => l.type === 'social')
      .reduce((sum, l) => sum + (l.durationMs || 0), 0);
    const websiteTotal = logs
      .filter(l => l.type === 'website')
      .reduce((sum, l) => sum + (l.durationMs || 0), 0);
    return res.json({
      success: true,
      data: {
        socialTotalMs: socialTotal,
        websiteTotalMs: websiteTotal,
        combinedTotalMs: socialTotal + websiteTotal,
      },
    });
  } catch (err) {
    console.error('getSummary error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
