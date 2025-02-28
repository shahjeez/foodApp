import express from "express";
import { saveAIResponse } from "../databaseService.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/save-response", authenticateToken, async (req, res) => {
  try {
    const { query, response } = req.body;
    const userId = req.user.id; //extracted from JWT

    if (!query || !response) {
      return res.status(400).json({ error: "Query and response required" });
    }

    const savedResponse = await saveAIResponse(userId, query, response);
    res.json(savedResponse);
  } catch (error) {
    res.status(500).json({ error: "Error saving AI response" });
  }
});

export default router;
