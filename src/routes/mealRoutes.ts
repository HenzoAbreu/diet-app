import express from "express";
import {
  createMealController,
  getAllMealsController,
  getAllMealsFromMealPlanController,
  getMealByUuidController,
  updateMealController,
  deleteMealController,
} from "../controllers/mealController";

const router = express.Router();

router.post("/", createMealController); // create meal
router.get("/", getAllMealsController); // get all
router.get("/mealplan/:meal_plan_id", getAllMealsFromMealPlanController); // get all from meal plan
router.get("/:meal_uuid", getMealByUuidController);
router.put("/:meal_uuid", updateMealController); // update meal
router.delete("/:meal_uuid", deleteMealController); //delete meal

export default router;
