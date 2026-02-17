// यह API confidence-wise analysis data देता है
const { getConfidenceWiseData } = require("./analysisDataService");

async function getConfidenceWiseAnalysis(req, res) {
  try {
    const data = await getConfidenceWiseData();
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = getConfidenceWiseAnalysis;
