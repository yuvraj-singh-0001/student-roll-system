require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/api/config/db");
const routes = require("./src/routes/router");

const app = express();

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

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:5173,https://ttt-olympaid.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true
  })
);

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

