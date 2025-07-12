export interface MealPlan {
  meal_plan_id: number;
  meal_plan_uuid: string;
  name: string;
  description: string | null;
  patient_id: number;
  created_at: Date;
  udpated_at: Date;
  deleted_at: Date | null;
}

export interface CreateMealPlanRequest {
  name: string;
  description?: string;
  patient_uuid: string;
}

export interface UpdateMealPlanRequest {
  name?: string;
  description?: string;
}

export interface MealPlanResponse {
  meal_plan_uuid: string;
  name: string;
  description: string | null;
  patient_uuid: string;
  meals_count?: number;
}

export interface MealPlanDetailResponse {
  meal_plan_uuid: string;
  name: string;
  description: string | null;
  patient_uuid: string;
  meals: Array<{
    meal_uuid: string;
    name: string;
    description: string | null;
    meal_order: number;
    foods: Array<{
      food_uuid: string;
      name: string;
      quantity: number; // in grams
      kcal_per_serving: number; // per 100g
      carbs_per_serving: number; // per 100g
      protein_per_serving: number; // per 100g
      fat_per_serving: number; // per 100g
      calculated_nutrition: {
        kcal: number;
        carbs: number;
        protein: number;
        fat: number;
      };
    }>;
    total_nutrition: {
      kcal: number;
      carbs: number;
      protein: number;
      fat: number;
    };
  }>;
  total_plan_nutrition: {
    kcal: number;
    carbs: number;
    protein: number;
    fat: number;
  };
}
