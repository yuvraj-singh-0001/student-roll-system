const ActivityLog = require('../../models/ActivityLog');

// GET /activity/summary/:studentId
module.exports = async (req, res) => {
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
