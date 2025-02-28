import express from "express";
import { loginUser } from "../controllers/authController.js";

import {
  registerUser,
  findUserByUsername,
  verifyPassword,
} from "../databaseService.js";
import { body, validationResult } from "express-validator";

const router = express.Router();
const SECRET_KEY = "shahjee"; //env

// Signup Route
router.post(
  "/signup",
  [
    body("username").isLength({ min: 3 }).trim().escape(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
      const existingUser = await findUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await registerUser(username, password);
      res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Error registering user", error });
    }
  }
);

// Login Route
router.post("/login", async (req, res) => {
  console.log("🔹 Received Body:", req.body); // Debugging
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const response = await loginUser(req, res);
    res.json(response);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
