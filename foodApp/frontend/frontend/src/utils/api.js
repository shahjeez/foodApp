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
      "/api/ai/get-ingredients",
      { dish, servings },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.ingredients;
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    throw error;
  }
};

// Login API Request
export const loginUser = async (email, password) => {
  const response = await api.post("/api/auth/login", { email, password });
  return response.data;
};

export default api;
