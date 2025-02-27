import dotenv from "dotenv";
dotenv.config();

export const API_KEY = process.env.OPENROUTER_API_KEY;
export const API_URL = "https://openrouter.ai/api/v1/chat/completions";
