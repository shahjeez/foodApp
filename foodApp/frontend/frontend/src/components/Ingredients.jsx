import React, { useState } from "react";
import { fetchIngredients } from "../utils/api";

const Ingredients = () => {
  const [dish, setDish] = useState("");
  const [servings, setServings] = useState(1);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token"); // Get token from storage
      const data = await fetchIngredients(dish, servings, token);
      setIngredients(data);
    } catch (err) {
      setError("Failed to fetch ingredients.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Get Ingredients</h2>
      <input
        type='text'
        placeholder='Enter dish name'
        value={dish}
        onChange={(e) => setDish(e.target.value)}
      />
      <input
        type='number'
        placeholder='Servings'
        value={servings}
        onChange={(e) => setServings(e.target.value)}
      />
      <button onClick={handleFetch} disabled={loading}>
        {loading ? "Loading..." : "Fetch Ingredients"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {ingredients.map((item, index) => (
          <li key={index}>
            {item.name}: {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Ingredients;
