const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/api/config/db");
const routes = require("./src/routes/router");
// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// ✅ Connect MongoDB
connectDB();

// Routes
app.use("/api", routes);

// Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
