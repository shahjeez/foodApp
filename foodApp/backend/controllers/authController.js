import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { findUserByUsername } from "../databaseService.js";

const SECRET_KEY = "shahjee"; // Keep this safe!

export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  console.log("🔹 Received login request:", { username, password });

  try {
    const user = await findUserByUsername(username);
    console.log("🔹 Found User:", user);

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔹 Password Match:", isMatch);

    if (!isMatch) {
      console.log("❌ Invalid credentials");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    console.log("✅ Generated JWT Token:", token);

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.log("❌ Login Error:", err);
    res.status(500).json({ error: "Login error" });
  }
};
