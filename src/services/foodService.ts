import {
  CreateFoodRequest,
  Food,
  UpdateFoodRequest,
} from "../models/foodModel";
import * as foodRepo from "../repositories/foodRepository";
import {
  v4 as uuidv4,
  validate as uuidValidate,
  version as uuidVersion,
} from "uuid";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  BadRequestError,
  InternalServerError,
} from "../utils/errors";
import { z } from "zod";

// For UUID v4 validation:
const isValidV4 = (uuid: string) =>
  uuidValidate(uuid) && uuidVersion(uuid) === 4;

const FoodSchema = z.object({
  food_name: z.string().min(1),
  kcal_per_serving: z.number().nonnegative(),
  carbs_per_serving: z.number().nonnegative(),
  protein_per_serving: z.number().nonnegative(),
  fat_per_serving: z.number().nonnegative(),
});

export const getFoodByUUID = async (
  food_uuid: string,
): Promise<Food | null> => {
  if (!food_uuid || !isValidV4(food_uuid)) {
    throw new BadRequestError("Invalid food UUID");
  }
  const food = await foodRepo.getFoodByUuid(food_uuid);
  if (!food) {
    throw new NotFoundError(`Food with id ${food_uuid} not found`);
  }

  return food;
};

export const getAllFood = async (): Promise<Food[]> => {
  const foods = await foodRepo.getAllFood();
  if (!foods) {
    throw new NotFoundError(`Food not found`);
  }
  return foods;
};

export const createFood = async (
  foodData: CreateFoodRequest,
): Promise<Food | null> => {
  let foodInput = {
    food_name: foodData.food_name.trim(),
    kcal_per_serving: foodData.kcal_per_serving,
    carbs_per_serving: foodData.carbs_per_serving,
    protein_per_serving: foodData.protein_per_serving,
    fat_per_serving: foodData.fat_per_serving,
  };
  const parsed = await FoodSchema.safeParse(foodInput);
  if (!parsed.success) {
    throw new ValidationError("Invalid food data!", parsed.error.flatten());
  }

  // Generate uuid
  const food_uuid = uuidv4();

  const parsedFood = parsed.data;

  const food: CreateFoodRequest = {
    food_uuid,
    food_name: parsedFood.food_name,
    kcal_per_serving: parsedFood.kcal_per_serving,
    carbs_per_serving: parsedFood.carbs_per_serving,
    protein_per_serving: parsedFood.protein_per_serving,
    fat_per_serving: parsedFood.fat_per_serving,
  };

  return await foodRepo.createFood(food);
};

export const updateFood = async (
  food_uuid: string,
  foodData: UpdateFoodRequest,
): Promise<Food | null> => {
  if (!food_uuid || !isValidV4(food_uuid)) {
    throw new BadRequestError("Invalid food UUID");
  }

  // Check if food id exists
  const foodExists = await foodRepo.getFoodByUuid(food_uuid);
  if (!foodExists) {
    throw new NotFoundError(`Food with UUID ${food_uuid} not found`);
  }

  // Validate field
  const validFields = [
    "food_name",
    "kcal_per_serving",
    "carbs_per_serving",
    "protein_per_serving",
    "fat_per_serving",
  ];

  for (const key in foodData) {
    if (!validFields.includes(key)) {
      throw new ValidationError(`Invalid field: ${key}!`);
    }

    const value = foodData[key as keyof UpdateFoodRequest];

    if (
      [
        "kcal_per_serving",
        "carbs_per_serving",
        "protein_per_serving",
        "fat_per_serving",
      ].includes(key)
    ) {
      if (
        value !== undefined &&
        (typeof value !== "number" || isNaN(value) || value < 0)
      ) {
        throw new ValidationError(`${key} must be a valid number`);
      }
    }

    if (key === "food_name") {
      if (typeof value !== "string" || value.trim().length === 0) {
        throw new ValidationError(`Food name cannot be empty!`);
      }
    }
  }
  const updatedFood = await foodRepo.updateFoodByUuid(food_uuid, foodData);
  if (!updatedFood) {
    throw new InternalServerError(
      `Failed to update food with UUID ${food_uuid}`,
    );
  }
  return updatedFood;
};

export const deleteFood = async (food_uuid: string): Promise<void> => {
  if (!food_uuid || !isValidV4(food_uuid)) {
    throw new BadRequestError("Invalid food UUID");
  }

  const foodExists = await foodRepo.getFoodByUuid(food_uuid);
  if (!foodExists) {
    throw new NotFoundError(`Food with UUID ${food_uuid} not found`);
  }

  await foodRepo.deleteFood(food_uuid);
};
