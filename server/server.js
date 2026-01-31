const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/api/config/db");
const routes = require("./src/routes/router");

const app = express();

// ✅ FIX: Proper CORS configuration
app.use(cors({
  origin: "http://localhost:5173", // Your React app URL
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ✅ Connect MongoDB
connectDB();

// Routes
app.use("/api", routes);

// Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});