import jwt from "jsonwebtoken";

const token = "your-jwt-token";
const decoded = jwt.decode(token);
console.log("Decoded Token:", decoded);
