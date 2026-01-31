import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

/* ================= AUTH ================= */

// ✅ Tumhare Login.jsx ke liye
export const loginUser = async (body) => {
  const res = await API.post("/auth/login", body);
  return res.data;
};

// (optional – future use)
export const registerUser = async (body) => {
  const res = await API.post("/auth/register", body);
  return res.data;
};

/* ================= PAYMENT ================= */

export const fakePay = async (userId) => {
  const res = await API.post("/payment/pay", { userId });
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
