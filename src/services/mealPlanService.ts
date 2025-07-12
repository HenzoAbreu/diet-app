import { BadRequestError, NotFoundError } from "../utils/errors";
import {
  CreateMealPlanRequest,
  MealPlan,
  MealPlanDetailResponse,
  MealPlanResponse,
  UpdateMealPlanRequest,
} from "../models/mealPlanModel";
import { v4 as uuidv4 } from "uuid";
import * as mealPlanRepo from "../repositories/mealPlanRepository";
import * as patientRepo from "../repositories/patientRepository";
import {
  calculateNutrition,
  calculateTotalNutrition,
} from "../utils/meal_calculations";

export const createMealPlanService = async (
  mealPlanData: CreateMealPlanRequest,
): Promise<MealPlan> => {
  if (!mealPlanData.patient_uuid) {
    throw new BadRequestError("Please insert a patient uuid!");
  }

  // get patient id from uuid
  const patient = await patientRepo.getPatientByUuid(mealPlanData.patient_uuid);
  if (!patient) {
    throw new NotFoundError("Patient not found!");
  }
  // create meal plan
  const mealPlan_uuid = uuidv4();
  const mealPlan = await mealPlanRepo.createMealPlan(
    mealPlanData,
    mealPlan_uuid,
    patient.patient_id,
  );

  // get created meal plan

  return mealPlan;
};

export const getMealPlanService = async (
  meal_plan_uuid: string,
): Promise<MealPlan> => {
  if (!meal_plan_uuid) {
    throw new BadRequestError("Please insert meal plan UUID");
  }

  const mealPlan = await mealPlanRepo.getMealPlanByUuid(meal_plan_uuid);
  if (!mealPlan) {
    throw new NotFoundError("Meal plan not found!");
  }

  return mealPlan;
};

export const getAllMealPlansService = async (): Promise<MealPlan[]> => {
  return await mealPlanRepo.getAllMealPlans();
};

export const updateMealPlanService = async (
  meal_plan_uuid: string,
  mealPlanData: UpdateMealPlanRequest,
): Promise<MealPlanResponse> => {
  const updatedMealPlan = await mealPlanRepo.updateMealPlan(
    meal_plan_uuid,
    mealPlanData,
  );
  if (!updatedMealPlan) {
    throw new NotFoundError("Meal Plan not found!");
  }

  const mealPlanWithCount =
    await mealPlanRepo.getMealPlanWithMealsCount(meal_plan_uuid);

  return {
    meal_plan_uuid: updatedMealPlan.meal_plan_uuid,
    name: updatedMealPlan.name,
    description: updatedMealPlan.description,
    patient_uuid: mealPlanWithCount?.patient_uuid || "",
    meals_count: mealPlanWithCount?.meals_count || 0,
  };
};

export const deleteMealPlanService = async (
  meal_plan_uuid: string,
): Promise<void> => {
  if (!meal_plan_uuid) {
    throw new BadRequestError("Meal Plan UUID required!");
  }

  await mealPlanRepo.deleteMealPlan(meal_plan_uuid);
};

export const getMealPlanDetailsService = async (
  meal_plan_uuid: string,
): Promise<MealPlanDetailResponse> => {
  if (!meal_plan_uuid) {
    throw new BadRequestError("Meal plan UUID required!");
  }

  const mealPlanDetail = await mealPlanRepo.getMealPlanDetail(meal_plan_uuid);
  if (!mealPlanDetail) {
    throw new NotFoundError("Meal plan not found!");
  }

  const { meal_plan, meals } = mealPlanDetail;

  // Process meals and calculate nutrition
  const processedMeals = meals.map(({ meal, foods }) => {
    // Calculate nutrition for each food
    const processedFoods = foods.map(({ food, quantity }) => {
      const calculatedNutrition = calculateNutrition(
        food.kcal_per_serving,
        food.carbs_per_serving,
        food.protein_per_serving,
        food.fat_per_serving,
        quantity,
      );

      return {
        food_uuid: food.food_uuid,
        name: food.name,
        quantity, // in grams
        kcal_per_serving: food.kcal_per_serving, // per 100g
        carbs_per_serving: food.carbs_per_serving, // per 100g
        protein_per_serving: food.protein_per_serving, // per 100g
        fat_per_serving: food.fat_per_serving, // per 100g
        calculated_nutrition: calculatedNutrition,
      };
    });

    // Calculate total nutrition for the meal
    const mealTotalNutrition = processedFoods.reduce(
      (total, food) => ({
        kcal: total.kcal + food.calculated_nutrition.kcal,
        carbs: total.carbs + food.calculated_nutrition.carbs,
        protein: total.protein + food.calculated_nutrition.protein,
        fat: total.fat + food.calculated_nutrition.fat,
      }),
      { kcal: 0, carbs: 0, protein: 0, fat: 0 },
    );

    return {
      meal_uuid: meal.meal_uuid,
      name: meal.name,
      description: meal.description,
      meal_order: meal.meal_order,
      foods: processedFoods,
      total_nutrition: {
        kcal: Math.round(mealTotalNutrition.kcal * 100) / 100,
        carbs: Math.round(mealTotalNutrition.carbs * 100) / 100,
        protein: Math.round(mealTotalNutrition.protein * 100) / 100,
        fat: Math.round(mealTotalNutrition.fat * 100) / 100,
      },
    };
  });

  // Calculate total nutrition for the entire plan
  const totalPlanNutrition = processedMeals.reduce(
    (total, meal) => ({
      kcal: total.kcal + meal.total_nutrition.kcal,
      carbs: total.carbs + meal.total_nutrition.carbs,
      protein: total.protein + meal.total_nutrition.protein,
      fat: total.fat + meal.total_nutrition.fat,
    }),
    { kcal: 0, carbs: 0, protein: 0, fat: 0 },
  );

  return {
    meal_plan_uuid: meal_plan.meal_plan_uuid,
    name: meal_plan.name,
    description: meal_plan.description,
    patient_uuid: meal_plan.patient_uuid,
    meals: processedMeals,
    total_plan_nutrition: {
      kcal: Math.round(totalPlanNutrition.kcal * 100) / 100,
      carbs: Math.round(totalPlanNutrition.carbs * 100) / 100,
      protein: Math.round(totalPlanNutrition.protein * 100) / 100,
      fat: Math.round(totalPlanNutrition.fat * 100) / 100,
    },
  };
};
