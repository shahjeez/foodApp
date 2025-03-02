import express from "express";
import { getIngredients } from "../controllers/ingredientController.js";
import authenticateToken from "../middleware/authMiddleware.js";
import pool from "../db.js";

const router = express.Router();

// ✅ Main AI-powered ingredient retrieval
router.post("/get-ingredients", authenticateToken, getIngredients);

// ✅ Fetch all AI responses for a user
router.get("/responses", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token
    const result = await pool.query(
      "SELECT * FROM ai_responses WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(result.rows); // Send all responses for the logged-in user
  } catch (error) {
    console.error("Error fetching AI responses:", error);
    res.status(500).json({ error: "Error fetching responses" });
  }
});

//manual clearing cache
router.delete("/clear-cache/:key", async (req, res) => {
  try {
    const { key } = req.params;
    await redisClient.del(key);
    res.json({ message: `Cache cleared for key: ${key}` });
  } catch (error) {
    res.status(500).json({ error: "Error clearing cache" });
  }
});

// ✅ Save AI response manually (if needed)
router.post("/save-response", authenticateToken, async (req, res) => {
  try {
    const { query, response } = req.body;
    const userId = req.user.id; // Extracted from JWT

    if (!query || !response) {
      return res.status(400).json({ error: "Query and response required" });
    }

    const savedResponse = await pool.query(
      "INSERT INTO ai_responses (user_id, query, response) VALUES ($1, $2, $3) RETURNING *",
      [userId, query, JSON.stringify(response)]
    );

    res.json(savedResponse.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error saving AI response" });
  }
});

// ✅ Fetch AI query history for user
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from JWT

    const result = await pool.query(
      "SELECT * FROM ai_responses WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching AI responses:", error);
    res.status(500).json({ error: "Error retrieving AI response history" });
  }
});

export default router;
