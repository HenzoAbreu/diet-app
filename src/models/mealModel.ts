import { Food } from "./foodModel";

export interface Meal {
  meal_id: number;
  meal_uuid: string;
  name: string;
  description: string | null;
  meal_plan_id: number;
  meal_order: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface MealFood {
  meal_food_id: number;
  meal_id: number;
  food_id: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface MealWithFoods extends Meal {
  foods: (Food & { quantity: number })[];
}

export interface CreateMealRequest {
  name: string;
  description?: string;
  meal_plan_uuid: string;
  meal_order?: number;
  foods?: Array<{
    food_uuid: string;
    quantity: number;
  }>;
}

export interface UpdateMealRequest {
  name?: string;
  description?: string;
  meal_order?: number;
  foods?: Array<{
    food_uuid: string;
    quantity: number;
  }>;
}

export interface MealResponse {
  meal_uuid: string;
  name: string;
  description: string | null;
  meal_plan_id: number;
  meal_order: number;
  foods: Array<{
    food_uuid: string;
    name: string;
    quantity: number;
    kcal_per_serving: number;
    carbs_per_serving: number;
    protein_per_serving: number;
    fat_per_serving: number;
  }>;
  total_nutrition: {
    total_kcal: number;
    total_carbs: number;
    total_protein: number;
    total_fat: number;
  };
}

export interface GetMealParams {
  meal_uuid: string;
}

export interface GetMealsQuery {
  page?: number;
  limit?: number;
  meal_plan_id?: number;
}

export interface AddFoodToMealRequest {
  food_uuid: string;
  quantity: number;
}

export interface UpdateFoodInMealRequest {
  food_uuid: string;
  quantity: number;
}

export interface DeleteFoodFromMealRequest {
  food_uuid: string;
}
