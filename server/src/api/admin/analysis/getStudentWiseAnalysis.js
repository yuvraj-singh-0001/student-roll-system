// यह API student-wise analysis data देता है
import { getStudentWiseData } from "./analysisDataService.js";

async function getStudentWiseAnalysis(req, res) {
  try {
    const data = await getStudentWiseData();
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}

export default getStudentWiseAnalysis;
