import express from "express";
import { getIngredients } from "../controllers/ingredientController.js";

const router = express.Router();

router.post("/get-ingredients", getIngredients);

export default router;
