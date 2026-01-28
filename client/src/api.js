import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

export const examApi = {
  register: (body) => API.post("/exam/register", body),
  submit: (body) => API.post("/exam/submit", body),
};

export const questionApi = {
  add: (body) => API.post("/question/add", body),
  bulkAdd: (body) => API.post("/question/bulk-add", body),
  all: () => API.get("/question/all"),
  exam: () => API.get("/question/exam"),
};

export const analysisApi = {
  students: () => API.get("/analysis/students"),
  questions: () => API.get("/analysis/questions"),
  confidence: () => API.get("/analysis/confidence"),
  dashboard: () => API.get("/analysis/dashboard"),
};

export default API;
