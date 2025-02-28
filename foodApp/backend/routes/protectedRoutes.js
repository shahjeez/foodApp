import express from "express";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/protected-route", authenticateToken, (req, res) => {
  res.json({ message: "You accessed a protected route!", user: req.user });
});

export default router;
