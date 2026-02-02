import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= AUTH ================= */

export const loginUser = async (body) => {
  const res = await API.post("/auth/login", body);
  // { success, message, token, user: { id, name, email, isPaid } }
  return res.data;
};

export const registerUser = async (body) => {
  const res = await API.post("/auth/register", body);
  // { success, message, data: { id, name, email } }
  return res.data;
};

/* ================= PAYMENT ================= */

export const fakePay = async (userId) => {
  const res = await API.post("/payment/pay", { userId });
  // { success, message, user }
  return res.data;
};

/* ================= EXAM ================= */

export const examApi = {
  register: (body) => API.post("/exam/register", body),
  submit: (body) => API.post("/exam/submit", body),
};

/* ================= QUESTIONS ================= */

export const questionApi = {
  add: (body) => API.post("/question/add", body),
  bulkAdd: (body) => API.post("/question/bulk-add", body),
  all: () => API.get("/question/all"),
  exam: () => API.get("/question/exam"),
};

/* ================= ANALYSIS ================= */

export const analysisApi = {
  students: () => API.get("/analysis/students"),
  questions: () => API.get("/analysis/questions"),
  confidence: () => API.get("/analysis/confidence"),
  dashboard: () => API.get("/analysis/dashboard"),
  studentExamDetails: (studentId) =>
    API.get(`/analysis/student-details/${studentId}`),
};

export default API;
