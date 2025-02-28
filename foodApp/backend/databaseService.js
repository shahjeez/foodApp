import pool from "./db.js";
import bcrypt from "bcryptjs";

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW();");
    console.log("Connected to PostgreSQL:", res.rows[0]);
  } catch (err) {
    console.error("Database connection error:", err);
  }
}

testConnection();

//Login Function
export const loginUser = async (username, password) => {
  const result = await pool.query("SELECT * FROM users WHERE username =$1", [
    username,
  ]);

  if (!result.rows.length) {
    throw new Error("User Not FOund");
  }

  const user = result.rows[0];

  //Verify Password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid Password");
  }

  return { token, user: { id: user.id, username: user.username } };
};

//Saving AI Responses
export const saveAIResponse = async (userId, query, response) => {
  const result = await pool.query(
    "INSERT INTO ai_responses (user_id, query, response) VALUE ($1,$2,$3) RETURNING *",
    [userId, query, response]
  );
  return result.rows[0];
};

//Create a new user with hashed password
export const registerUser = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
    [username, hashedPassword]
  );
  return result.rows[0];
};

//Find user by username
export const findUserByUsername = async (username) => {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return result.rows[0];
};

//Verify password during login
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
