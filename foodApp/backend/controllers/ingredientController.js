import axios from "axios";
import { API_KEY, API_URL } from "../config/dotenvConfig.js";

export const getIngredients = async (req, res) => {
  const { dish } = req.body;

  if (!dish) {
    return res.status(400).json({ error: "Dish name is required" });
  }

  const prompt = `List only the ingredients and their serving quantities for '${dish}' in JSON format. Each ingredient should be an object with 'name' and 'quantity'.`;

  try {
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

    // Check if response structure is valid
    if (
      !response.data ||
      !response.data.choices ||
      !response.data.choices.length
    ) {
      console.error("Unexpected API Response:", response.data);
      return res.status(500).json({
        error: "Invalid API response structure",
        details: response.data,
      });
    }

    const aiResponse = response.data.choices[0].message.content;

    // Debugging: Log raw response
    console.log("Raw AI Response:", aiResponse);

    // Extract JSON more reliably
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
    const cleanJson = jsonMatch ? jsonMatch[1].trim() : aiResponse.trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanJson);
    } catch (jsonError) {
      console.error("JSON Parsing Error:", jsonError.message);
      console.error("Raw Response:", aiResponse); // Debugging raw response
      return res.status(500).json({
        error: "Invalid JSON format in API response",
        rawResponse: aiResponse, // Send raw response for debugging
        details: jsonError.message,
      });
    }

    // Ensure the expected format
    if (!parsedData.ingredients || !Array.isArray(parsedData.ingredients)) {
      console.error("Unexpected JSON Format:", parsedData);
      return res
        .status(500)
        .json({ error: "Invalid ingredients format", details: parsedData });
    }

    // Format the ingredients correctly
    const formattedIngredients = parsedData.ingredients.map((item) => ({
      name: item.name,
      quantity: item.quantity,
    }));

    console.log("Formatted Ingredients:", formattedIngredients);

    res.json({ ingredients: formattedIngredients });
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error fetching ingredients",
      details: error.response?.data || error.message,
    });
  }
};
