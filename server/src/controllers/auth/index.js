import express from "express";
const router = express.Router();
import register from "../../api/auth/Register.js";
import login from "../../api/auth/login.js";
import authMiddleware from "../../middlewares/auth.js";

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

export default router;