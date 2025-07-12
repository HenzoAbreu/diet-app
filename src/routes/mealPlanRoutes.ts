import express from "express";
import {
  createMealPlanController,
  getMealPlanController,
  getAllMealPlansController,
  updateMealPlan,
  deleteMealPlanController,
  getMealPlanDetailsController,
} from "../controllers/mealPlanController";

const router = express.Router();

router.post("/", createMealPlanController); // create meal plan
router.get("/:meal_plan_uuid", getMealPlanController); // get meal plan by uuid
router.get("/", getAllMealPlansController); // get all meal plans
router.get("/details/:meal_plan_uuid", getMealPlanDetailsController); // get all meal plans
router.put("/:meal_plan_uuid", updateMealPlan); //update meal plan
router.delete("/:meal_plan_uuid", deleteMealPlanController); //delete meal plan
router.delete("/:meal_plan_uuid", deleteMealPlanController); //delete meal plan

export default router;
