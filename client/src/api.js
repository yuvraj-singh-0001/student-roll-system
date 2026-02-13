// src/api/api.js
import axios from "axios";

/* ================= AXIOS INSTANCE ================= */

// Auto detect environment
const isProduction = import.meta.env.PROD;

// Development URL
const DEV_URL = "http://localhost:5000/api";

// Production URL (Render backend)
const PROD_URL = "https://student-roll-system.onrender.com/api";

// Allow override from env (Vercel / local)
const ENV_URL = import.meta.env.VITE_API_BASE_URL;
const CLEAN_ENV_URL = ENV_URL && String(ENV_URL).trim();
// Final Base URL
// Dev mode: default to localhost, unless ENV points to a non-prod URL.
const API_BASE_URL = isProduction
  ? (CLEAN_ENV_URL || PROD_URL)
  : (CLEAN_ENV_URL && CLEAN_ENV_URL !== PROD_URL ? CLEAN_ENV_URL : DEV_URL);
const ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // cookies ke liye
  timeout: 30000,
});

export const warmUpBackend = async () => {
  try {
    await fetch(ROOT_URL, { method: "GET" });
  } catch {
    // ignore warmup errors
  }
};

/* ===================================================
   AUTH
=================================================== */

export const registerFormA = async (body) => {
  const res = await API.post("/auth/register", body);
  return res.data;
};

export const loginUser = async (body) => {
  const res = await API.post("/auth/login", body);
  return res.data;
};

/* ===================================================
   PAYMENT
=================================================== */

export const makePayment = async (body) => {
  const res = await API.post("/payment/success", body);
  return res.data;
};

/* ===================================================
   ADMIN CHECK
=================================================== */

export const checkStudent = async (query) => {
  const res = await API.get("/admin/check", {
    params: query,
  });
  return res.data;
};

/* ===================================================
   EXAM
=================================================== */

export const examApi = {
  register: (body) => API.post("/exam/register", body),
  submit: (body) => API.post("/exam/olympiad/submit", body),
  list: () => API.get("/exam/list"),
};

/* ===================================================
   QUESTIONS
=================================================== */

export const questionApi = {
  // ek-ek question add (humara AdminQuestionBuilder isi ko use karega)
  add: (body) => API.post("/question/add", body),

  // future ke liye bulk import agar tum excel ya json se karna chaho
  bulkAdd: (body) => API.post("/question/bulk-add", body),

  // sab questions (admin listing ke liye)
  all: () => API.get("/question/all"),

  // exam dene wale student ke liye filtered questions
  exam: (params) => API.get("/question/exam", { params }),
  // ⭐ examCode ke basis pe saare questions
  byExamCode: (examCode) => API.get("/question/exam", { params: { examCode } }),
};

/* ===================================================
   EXAM SUBMISSION (Olympiad)
=================================================== */

export const olympiadExamApi = {
  submit: (body) => API.post("/exam/olympiad/submit", body),
  attempts: (params) => API.get("/exam/olympiad/attempts", { params }),
  attemptDetails: (attemptId) =>
    API.get(`/exam/olympiad/attempts/${attemptId}`),
};

/* ===================================================
   ANALYSIS
=================================================== */

export const analysisApi = {
  students: () => API.get("/analysis/students"),
  questions: () => API.get("/analysis/questions"),
  confidence: () => API.get("/analysis/confidence"),
  dashboard: () => API.get("/analysis/dashboard"),
  studentExamDetails: (studentId) =>
    API.get(`/analysis/student-details/${studentId}`),
};

export default API;
