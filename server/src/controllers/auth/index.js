const express = require("express");
const  register  = require("../../api/auth/Register");
const  login  = require("../../api/auth/login");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

module.exports = router;
