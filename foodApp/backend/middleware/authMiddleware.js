import jwt from "jsonwebtoken";

const SECRET_KEY = "shahjee"; // Must match login/signup

const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("🔹 Received Authorization Header:", authHeader); // Debugging

  if (!authHeader) {
    console.log("❌ No token provided");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Extract token
  console.log("🔹 Extracted Token:", token); // Debugging

  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    console.log("✅ Token verified:", verified);
    req.user = verified;
    next();
  } catch (error) {
    console.log("❌ Invalid token:", error.message);
    res.status(403).json({ error: "Invalid token" });
  }
};

export default authenticateToken;
