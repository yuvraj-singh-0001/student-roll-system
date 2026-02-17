// यह API question-wise analysis data देता है
const { getQuestionWiseData } = require("./analysisDataService");

async function getQuestionWiseAnalysis(req, res) {
  try {
    const data = await getQuestionWiseData();
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = getQuestionWiseAnalysis;
