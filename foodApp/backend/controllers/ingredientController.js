import axios from "axios";
import pool from "../db.js"; // Import database connection
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
      return res.json({ ingredients: JSON.parse(cachedData) });
    }

    console.log("❌ Not in cache, checking DB...");

    // Check Database
    const dbQuery = await pool.query(
      "SELECT response FROM ai_responses WHERE query = $1 AND servings = $2",
      [dish, servings]
    );

    if (dbQuery.rows.length > 0) {
      console.log("✅ Retrieved from database");
      const dbData = dbQuery.rows[0].response;

      // Store in cache
      await redisClient.setex(
        cacheKey,
        43200,
        JSON.stringify(formattedIngredients)
      ); // 43200 seconds = 12 hours

      return res.json({ ingredients: dbData });
    }

    console.log("❌ Not in DB, calling AI...");

    // AI Call
    const prompt = `List only the ingredients and their serving quantities for '${dish}' for ${servings} servings in JSON format. Each ingredient should be an object with 'name' and 'quantity'.`;

    const response = await axios.post(
      API_URL,
      {
        model: "deepseek/deepseek-r1:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    // Extract JSON
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
    const cleanJson = jsonMatch ? jsonMatch[1].trim() : aiResponse.trim();
    const parsedData = JSON.parse(cleanJson);

    if (!parsedData.ingredients || !Array.isArray(parsedData.ingredients)) {
      return res.status(500).json({ error: "Invalid ingredients format" });
    }

    const formattedIngredients = parsedData.ingredients.map((item) => ({
      name: item.name,
      quantity: item.quantity,
    }));

    console.log("✅ AI Response Processed:", formattedIngredients);

    // Save to DB
    await pool.query(
      "INSERT INTO ai_responses (user_id, query, servings, response) VALUES ($1, $2, $3, $4)",
      [req.user.id, dish, servings, JSON.stringify(formattedIngredients)]
    );

    // Save to Redis
    await redisClient.setEx(
      cacheKey,
      3600,
      JSON.stringify(formattedIngredients)
    );

    res.json({ ingredients: formattedIngredients });
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Error fetching ingredients" });
  }
};
