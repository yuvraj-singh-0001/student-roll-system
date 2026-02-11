import axios from "axios";

/* ================= AXIOS INSTANCE ================= */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/+$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ðŸ”¥ VERY IMPORTANT (cookie ke liye)
});

/* ===================================================
   AUTH (Form A based)
=================================================== */

// Form A Registration (name + mobile + class)
export const registerFormA = async (body) => {
  const res = await API.post("/auth/register", body);
  // { success, message, student }
  return res.data;
};

// Agar future me login add karna ho
export const loginUser = async (body) => {
  const res = await API.post("/auth/login", body);
  return res.data;
};

/* ===================================================
   PAYMENT
=================================================== */

// Payment success (cookie se user identify hoga)
export const makePayment = async (body) => {
  const res = await API.post("/payment/success", body);
  // { success, message }
  return res.data;
};

/* ===================================================
   ADMIN CHECK (Name / Mobile se search)
=================================================== */

export const checkStudent = async (query) => {
  const res = await API.get("/admin/check", {
    params: query,
  });
  return res.data;
};

/* ===================================================
   EXAM (Future use)
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

export { API_BASE_URL };

export default API;


