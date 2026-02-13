const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const headerToken =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;
  const token = req.cookies.token || headerToken || req.headers["x-auth-token"];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Login required"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

module.exports = authMiddleware;
