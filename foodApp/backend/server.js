import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ingredientRoutes from "./routes/ingredientRoutes.js";
import authRoutes from "./routes/authRoutes.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

//API Routes
app.use("/api", ingredientRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

