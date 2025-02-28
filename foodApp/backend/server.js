import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ingredientRoutes from "./routes/ingredientRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

//API Routes
app.use("/api", ingredientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", protectedRoutes); // Protected routes

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
