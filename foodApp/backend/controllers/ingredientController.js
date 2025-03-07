import axios from "axios";
import pool from "../db.js";
import { API_KEY, API_URL } from "../config/dotenvConfig.js";
import redisClient from "../cache.js";
import slugify from "slugify";

export const getIngredients = async (req, res) => {
  const { dish, servings } = req.body;

  if (!dish || !servings) {
    return res.status(400).json({ error: "Dish name and servings required" });
  }

  try {
    const dishSlug = slugify(dish, { lower: true, strict: true });
    const cacheKey = `ingredients:${dishSlug}:${servings}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("✅ Retrieved from cache");
      return res.json(JSON.parse(cachedData)); // ✅ Added return to prevent further execution
    }

    console.log("❌ Not in cache, checking DB...");

    // Check Database
    const dbQuery = await pool.query(
      "SELECT response FROM ai_responses WHERE query = $1 AND servings = $2",
      [dish, servings]
    );

    if (dbQuery.rows.length > 0) {
      console.log("✅ Retrieved from database");
      let dbData = dbQuery.rows[0].response;

      if (typeof dbData === "string") {
        try {
          dbData = JSON.parse(dbData);
        } catch (error) {
          console.error("❌ Database JSON Parsing Error:", error.message);
          return res.status(500).json({ error: "Failed to parse stored data" }); // ✅ Added return
        }
      }

      await redisClient.setEx(cacheKey, 43200, JSON.stringify(dbData));
      return res.json(dbData); // ✅ Added return
    }

    console.log("❌ Not in DB, calling AI...");

    // AI Call with Procedure
    const prompt = `
You are a food AI that **only returns JSON**.
Do not add explanations, reasoning, or thoughts. Just output structured JSON.

### **Input**
Dish: "${dish}"
Servings: ${servings}

### **Expected Output (MUST be valid JSON)**
{
  "ingredients": [
    { "name": "Ingredient 1", "quantity": "Amount" },
    { "name": "Ingredient 2", "quantity": "Amount" }
  ],
  "procedure": "Step 1: ... Step 2: ... Step 3: ..."
}

### **Rules**
- **Only output JSON** (No reasoning, no extra text).
- Ensure "ingredients" is an **array**.
- Ensure "procedure" is a **single string** with step-by-step instructions.
- **Do NOT add any extra words or explanations**.
- **Do NOT return an empty response**.
`;

    const response = await axios.post(
      API_URL,
      {
        model: "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "system",
            content:
              "You are an AI that only outputs valid JSON. No extra text, no reasoning.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiResponse = response.data.choices[0]?.message?.content?.trim();

    console.log("🟡 AI Raw Response:", JSON.stringify(response.data, null, 2));

    if (!aiResponse || aiResponse.length === 0) {
      console.error("❌ AI Response is empty or undefined");
      return res.status(500).json({ error: "AI response is empty" }); // ✅ Added return
    }

    let parsedData;
    try {
      parsedData = JSON.parse(aiResponse);
    } catch (error) {
      console.error("❌ JSON Parsing Error:", error.message);
      return res.status(500).json({ error: "Failed to process AI response" }); // ✅ Added return
    }

    console.log("✅ AI Response Processed:", parsedData);

    // Send the response immediately after processing
    res.json(parsedData);

    // Save to DB
    await pool.query(
      "INSERT INTO ai_responses (user_id, query, servings, response) VALUES ($1, $2, $3, $4)",
      [req.user.id, dish, servings, JSON.stringify(parsedData)]
    );

    // Save to Redis
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(parsedData));

    return; // ✅ Ensures no further execution
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Error fetching recipe data" }); // ✅ Added return
  }
};
