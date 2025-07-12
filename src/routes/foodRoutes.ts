import express from "express";
import {
  getAllFoodController,
  createFoodController,
  updateFoodController,
  deleteFoodController,
  getFoodByUUIDController,
} from "../controllers/foodController";

const router = express.Router();

router.get("/", getAllFoodController); // listar todos alimentos
router.get("/:food_uuid", getFoodByUUIDController); // listar alimento por ID
router.post("/", createFoodController); // criar alimento
router.put("/:food_uuid", updateFoodController); // atualizar alimento
router.delete("/:food_uuid", deleteFoodController); // deletar alimento

export default router;
