import axios from "axios";

/* ================= AXIOS INSTANCE ================= */

// Auto detect environment
const isProduction = import.meta.env.PROD;

// Development URL
const DEV_URL = "http://localhost:5000/api";

// Production URL (Render backend)
const PROD_URL = "https://student-roll-system.onrender.com/api";

// Final Base URL
const API_BASE_URL = isProduction ? PROD_URL : DEV_URL;

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // cookies ke liye
});

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
  submit: (body) => API.post("/exam/submit", body),
};

/* ===================================================
   QUESTIONS
=================================================== */

export const questionApi = {
  add: (body) => API.post("/question/add", body),
  bulkAdd: (body) => API.post("/question/bulk-add", body),
  all: () => API.get("/question/all"),
  exam: () => API.get("/question/exam"),
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
