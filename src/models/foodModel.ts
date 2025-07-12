export interface Food {
  food_id: number;
  food_uuid: string;
  foodname: string;
  kcal_per_serving: number;
  carbs_per_serving: number;
  protein_per_serving: number;
  fat_per_serving: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreateFoodRequest {
  food_uuid?: string;
  food_name: string;
  kcal_per_serving: number;
  carbs_per_serving: number;
  protein_per_serving: number;
  fat_per_serving: number;
}

export interface UpdateFoodRequest {
  food_name?: string;
  kcal_per_serving?: number;
  carbs_per_serving?: number;
  protein_per_serving?: number;
  fat_per_serving?: number;
}

export interface FoodResponse {
  food_uuid: string;
  food_name: string;
  kcal_per_serving: number;
  carbs_per_serving: number;
  protein_per_serving: number;
  fat_per_serving: number;
}
