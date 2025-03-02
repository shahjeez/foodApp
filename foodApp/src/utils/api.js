import axios from "axios";

const API_BASE_URL = "http://localhost:4000"; // Update if backend runs on another port

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchIngredients = async (dish, servings, token) => {
  try {
    const response = await api.post(
      "/get-ingredients",
      { dish, servings },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.ingredients;
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    throw error;
  }
};

export default api;
