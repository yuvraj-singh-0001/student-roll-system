require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/api/config/db");
const routes = require("./src/routes/router");

const app = express();
app.set("trust proxy", 1);

/* ======================
   DATABASE
====================== */
connectDB();

/* ======================
   MIDDLEWARES
====================== */

app.use(express.json());
app.use(cookieParser());

/* ===== CORS FIX FOR PRODUCTION ===== */

const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "https://ttt-olympaid.vercel.app",
];
const envOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith(".vercel.app")) return true;
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return true;
  } catch {
    // ignore
  }
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true
  })
);

/* ======================
   HEALTH CHECK
====================== */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

/* ======================
   ROUTES
====================== */

app.use("/api", routes);

/* ======================
   TEST ROUTE
====================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server running successfully"
  });
});

/* ======================
   SERVER START
====================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

