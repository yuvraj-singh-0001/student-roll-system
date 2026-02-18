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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  const status = error?.response?.status;
  if (!status) return true;
  if (status >= 500) return true;
  if (status === 429) return true;
  return false;
};

const requestWithRetry = async (requestFn, options = {}) => {
  const retries = Number.isFinite(options.retries) ? options.retries : 2;
  const delayMs = Number.isFinite(options.delayMs) ? options.delayMs : 1200;
  const backoff = Number.isFinite(options.backoff) ? options.backoff : 2;
  let attempt = 0;

  while (true) {
    try {
      return await requestFn(attempt);
    } catch (err) {
      if (attempt >= retries || !isRetryableError(err)) {
        throw err;
      }
      const wait = Math.round(delayMs * Math.pow(backoff, attempt));
      await sleep(wait);
      attempt += 1;
    }
  }
};

export const warmUpBackend = async (options = {}) => {
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 8000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(`${ROOT_URL}/api/health`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
  } catch {
    // ignore warmup errors
  } finally {
    clearTimeout(timer);
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
  register: (body) => API.post("/olympiad/register", body),
  submit: (body) => API.post("/olympiad/submit", body),
  list: (options = {}) => {
    const timeoutMs = Number.isFinite(options.timeoutMs)
      ? options.timeoutMs
      : 45000;
    return requestWithRetry(
      () => API.get("/olympiad/list", { timeout: timeoutMs }),
      {
        retries: Number.isFinite(options.retries) ? options.retries : 2,
        delayMs: Number.isFinite(options.retryDelayMs)
          ? options.retryDelayMs
          : 1500,
        backoff: 2,
      }
    );
  },
};

/* ===================================================
   QUESTIONS
=================================================== */

export const questionApi = {
  // ek-ek question add (humara AdminQuestionBuilder isi ko use karega)
  add: (body) => API.post("/question/add", body),

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
  submit: (body) => API.post("/olympiad/submit", body),
  attempts: (params) => API.get("/olympiad/attempts", { params }),
  attemptDetails: (attemptId) =>
    API.get(`/olympiad/attempts/${attemptId}`),
};

/* ===================================================
   ANALYSIS
=================================================== */

export const analysisApi = {
  students: () => API.get("/analysis/students"),
  questions: () => API.get("/analysis/questions"),
  confidence: () => API.get("/analysis/confidence"),
  dashboard: () => API.get("/analysis/dashboard"),
  studentExamDetails: (studentId, params) =>
    API.get(`/analysis/student-details/${studentId}`, { params }),
  examQuestionHighlights: (params) =>
    API.get("/analysis/exam/question-highlights", { params }),
  examStudentResults: (params) =>
    API.get("/analysis/exam/student-results", { params }),
  adminOverview: () => API.get("/analysis/admin/overview"),
};

export default API;
