require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/api/config/db"); // tumhara DB file
const routes = require("./src/routes/router"); // tumhara main router file

const app = express();

/* ======================
   DATABASE
====================== */
connectDB();

/* ======================
   MIDDLEWARES
====================== */

// JSON body parser
app.use(express.json());

// Cookie parser (JWT ke liye)
app.use(cookieParser());

// CORS (cookie allow karne ke liye IMPORTANT)
app.use(
  cors({
    origin: "http://localhost:5173", // apna frontend URL
    credentials: true
  })
);

/* ======================
   ROUTES (unchanged)
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
