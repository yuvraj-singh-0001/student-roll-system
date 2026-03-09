// यह API question-wise analysis data देता है
import { getQuestionWiseData } from "./analysisDataService.js";

async function getQuestionWiseAnalysis(req, res) {
  try {
    const data = await getQuestionWiseData();
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

export default getQuestionWiseAnalysis;
