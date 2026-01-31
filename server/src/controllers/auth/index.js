const express = require("express");
const router = express.Router();
const register = require("../../api/auth/register");
const login = require("../../api/auth/login");
const authMiddleware = require("../../middlewares/auth");

// ✅ CORRECT endpoints
router.post("/register", register);  // This will be /api/auth/register
router.post("/login", login);        // This will be /api/auth/login

// TEST PROTECTED
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "You are authenticated",
    user: req.user
  });
});

module.exports = router;