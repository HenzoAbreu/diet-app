import {
  CreateMealRequest,
  Meal,
  MealResponse,
  UpdateMealRequest,
} from "../models/mealModel";
import * as mealRepo from "../repositories/mealRepository";
import { v4 as uuidv4 } from "uuid";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  InternalServerError,
  BadRequestError,
} from "../utils/errors";
import { calculateTotalNutrition } from "../utils/meal_calculations";

const convertMealToResponse = (meal: any): MealResponse => {
  const totalNutrition = calculateTotalNutrition(meal.foods);

  return {
    meal_uuid: meal.meal_uuid,
    name: meal.name,
    description: meal.description,
    meal_plan_id: meal.meal_plan_id,
    meal_order: meal.meal_order,
    foods: meal.foods.map((food: any) => ({
      food_uuid: food.food_uuid,
      name: food.name,
      quantity: food.quantity,
      kcal_per_serving: food.kcal_per_serving,
      carbs_per_serving: food.carbs_per_serving,
      protein_per_serving: food.protein_per_serving,
      fat_per_serving: food.fat_per_serving,
    })),
    total_nutrition: totalNutrition,
  };
};

export const createMealService = async (
  mealData: CreateMealRequest,
): Promise<MealResponse> => {
  const meal_uuid = uuidv4();
  const meal = await mealRepo.createMeal(meal_uuid, mealData);
  if (!meal) {
    throw new InternalServerError("Failed to create meal!");
  }
  return convertMealToResponse(meal);
};

export const getAllMealsService = async (): Promise<Meal[]> => {
  const meals = await mealRepo.getAllMeals();

  return meals;
};

export const getAllMealsFromMealPlanService = async (
  meal_plan_id: number,
): Promise<Meal[]> => {
  if (!meal_plan_id) {
    throw new BadRequestError("Meal plan id required");
  }

  const meals = await mealRepo.getAllMealsFromMealPlan(meal_plan_id);

  return meals;
};

export const getMealByUuidService = async (
  meal_uuid: string,
): Promise<MealResponse> => {
  if (!meal_uuid) {
    throw new BadRequestError("Meal UUID required!");
  }

  const meal = await mealRepo.getMealByUuid(meal_uuid);
  if (!meal) {
    throw new NotFoundError("Meal not found!");
  }

  return convertMealToResponse(meal);
};

export const updateMealService = async (
  meal_uuid: string,
  mealData: UpdateMealRequest,
): Promise<MealResponse> => {
  if (!meal_uuid) {
    throw new BadRequestError("Meal UUID required!");
  }

  const updatedMeal = await mealRepo.updateMeal(meal_uuid, mealData);

  return convertMealToResponse(updatedMeal);
};

export const deleteMealService = async (meal_uuid: string): Promise<void> => {
  if (!meal_uuid) {
    throw new BadRequestError("Meal UUID required!");
  }

  await mealRepo.deleteMeal(meal_uuid);
};
