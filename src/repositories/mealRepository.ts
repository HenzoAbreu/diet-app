import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../utils/errors";
import { getPool } from "../db/dbConnect";
import {
  CreateMealRequest,
  Meal,
  MealWithFoods,
  UpdateMealRequest,
} from "../models/mealModel";
import { getMealPlanByUuid } from "./mealPlanRepository";
import { getFoodByUUID } from "../services/foodService";
import { getFoodByUuid } from "./foodRepository";

export const createMeal = async (
  meal_uuid: string,
  mealData: CreateMealRequest,
): Promise<MealWithFoods> => {
  const pool = getPool();

  // get meal plan id with its uuid
  const mealPlan = await getMealPlanByUuid(mealData.meal_plan_uuid);
  if (!mealPlan) {
    throw new NotFoundError("Meal plan not found!");
  }

  const meal_plan_id = mealPlan.meal_plan_id;

  // create connection
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    let meal_order = mealData.meal_order;
    if (meal_order === undefined) {
      const [orderRows] = await connection.execute(
        "SELECT COALESCE(MAX(meal_order), 0) + 1 as next_order FROM tb_meal WHERE meal_plan_id = ? AND deleted_at IS NULL;",
        [meal_plan_id],
      );
      meal_order = (orderRows as any[])[0].next_order;
    }

    // create meal
    const [result] = await connection.execute(
      "INSERT INTO tb_meal (meal_uuid, name, description, meal_plan_id, meal_order) VALUES (?, ?, ?, ?, ?)",
      [
        meal_uuid,
        mealData.name,
        mealData.description || null,
        meal_plan_id,
        meal_order,
      ],
    );

    // get created meal
    const [mealRows] = await connection.execute(
      "SELECT meal_id, meal_uuid, name, description, meal_plan_id, meal_order, created_at, updated_at FROM tb_meal WHERE meal_uuid = ?;",
      [meal_uuid],
    );
    const meals = mealRows as any[];
    if (meals.length === 0) {
      throw new InternalServerError("Failed to create meal!");
    }

    const meal = meals[0];

    // add foods of the meal to tb_meal_food
    const foods: any[] = [];
    if (mealData.foods && mealData.foods.length > 0) {
      for (const foodItem of mealData.foods) {
        const food = await getFoodByUUID(foodItem.food_uuid);
        if (!food) {
          throw new NotFoundError(
            `Food with uuid ${foodItem.food_uuid} not found!`,
          );
        }

        await connection.execute(
          "INSERT INTO tb_meal_food (meal_id, food_id, quantity) VALUES (?, ?, ?)",
          [meal.meal_id, food.food_id, foodItem.quantity],
        );
        foods.push({
          ...food,
          quantity: foodItem.quantity,
        });
      }
    }

    await connection.commit();
    connection.release();

    return { ...meal, foods };
  } catch (err) {
    await connection.rollback();
    connection.release();
    throw new InternalServerError("INTERNAL SERVER ERROR");
  }
};

export const getAllMeals = async (): Promise<Meal[]> => {
  const pool = getPool();
  const query =
    "SELECT meal_id, meal_uuid, name, description, meal_plan_id, meal_order, created_at, updated_at FROM tb_meal WHERE deleted_at IS NULL ORDER BY meal_order;";

  const [rows] = await pool.execute(query);

  const meals = rows as any[];

  return meals;
};

export const getAllMealsFromMealPlan = async (
  meal_plan_id: number,
): Promise<Meal[]> => {
  const pool = getPool();
  const query =
    "SELECT meal_id, meal_uuid, name, description, meal_plan_id, meal_order, created_at, updated_at FROM tb_meal WHERE deleted_at IS NULL ORDER BY meal_order;";

  const [rows] = await pool.execute(query, [meal_plan_id]);
  const meals = rows as any[];
  return meals;
};

export const getMealByUuid = async (
  meal_uuid: string,
): Promise<MealWithFoods | null> => {
  const pool = getPool();
  const query =
    "SELECT meal_id, meal_uuid, name, description, meal_plan_id, meal_order, created_at, updated_at FROM tb_meal WHERE meal_uuid = ? AND deleted_at IS NULL;";

  const [rows] = await pool.execute(query, [meal_uuid]);
  const meals = rows as any;
  if (meals.length === 0) {
    return null;
  }
  const meal = meals[0];

  //get foods from meal
  const query2 = `
    SELECT 
    f.food_id, 
    f.food_uuid, 
    f.food_name, 
    f.kcal_per_serving, 
    f.carbs_per_serving, 
    f.protein_per_serving, 
    f.fat_per_serving, 
    f.created_at, 
    f.updated_at, 
    mf.quantity
    FROM tb_meal_food mf
    JOIN tb_food f ON mf.food_id = f.food_id
    WHERE mf.meal_id = ? AND f.deleted_at IS NULL
    ORDER BY f.food_name
    ;`;
  const [foodRows] = await pool.execute(query2, [meal.meal_id]);
  const foods = (foodRows as any[]).map((row: any) => ({
    ...row,
    kcal_per_serving: Number(row.kcal_per_serving),
    carbs_per_serving: Number(row.carbs_per_serving),
    protein_per_serving: Number(row.protein_per_serving),
    fat_per_serving: Number(row.fat_per_serving),
    quantity: Number(row.quantity),
  }));

  return { ...meal, foods };
};

export const updateMeal = async (
  meal_uuid: string,
  mealData: UpdateMealRequest,
): Promise<MealWithFoods> => {
  const pool = getPool();
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (mealData.name !== undefined) {
      if (mealData.name === "") {
        throw new BadRequestError("Field {name} cannot be empty");
      }
      updateFields.push("name = ?");
      updateValues.push(mealData.name);
    }
    if (mealData.description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(mealData.description);
    }
    if (mealData.meal_order !== undefined) {
      updateFields.push("meal_order = ?");
      updateValues.push(mealData.meal_order);
    }

    if (updateFields.length > 0) {
      updateValues.push(meal_uuid);
      await connection.execute(
        `UPDATE tb_meal SET ${updateFields.join(", ")} WHERE meal_uuid = ? AND deleted_at IS NULL`,
        updateValues,
      );
    }

    // Update foods if provided
    if (mealData.foods !== undefined) {
      // Get current meal
      const [mealRows] = await connection.execute(
        "SELECT meal_id FROM tb_meal WHERE meal_uuid = ? AND deleted_at IS NULL",
        [meal_uuid],
      );

      const meals = mealRows as any[];
      if (meals.length === 0) {
        throw new NotFoundError("Meal not found");
      }

      const meal_id = meals[0].meal_id;

      // Remove existing foods
      await connection.execute("DELETE FROM tb_meal_food WHERE meal_id = ?", [
        meal_id,
      ]);

      // Add new foods
      for (const foodItem of mealData.foods) {
        const food = await getFoodByUuid(foodItem.food_uuid);
        if (!food) {
          throw new NotFoundError(
            `Food with UUID ${foodItem.food_uuid} not found`,
          );
        }

        await connection.execute(
          "INSERT INTO tb_meal_food (meal_id, food_id, quantity) VALUES (?, ?, ?)",
          [meal_id, food.food_id, foodItem.quantity],
        );
      }
    }

    await connection.commit();
    connection.release();

    const updatedMeal = await getMealByUuid(meal_uuid);
    if (!updatedMeal) {
      throw new NotFoundError("Meal not found");
    }

    return updatedMeal;
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
};

export const deleteMeal = async (meal_uuid: string): Promise<void> => {
  const pool = getPool();
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // get meal id to delete meal foods
    const [mealRows] = await connection.execute(
      "SELECT meal_id FROM tb_meal WHERE meal_uuid = ? AND deleted_at IS NULL;",
      [meal_uuid],
    );
    const meals = mealRows as any[];
    if (meals.length === 0) {
      throw new NotFoundError("Meal not found!");
    }

    const meal_id = meals[0].meal_id;

    // delete the foods
    await connection.execute("DELETE FROM tb_meal_food WHERE meal_id = ?;", [
      meal_id,
    ]);

    // delete meal
    const [result] = await connection.execute(
      "UPDATE tb_meal SET deleted_at = CURRENT_TIMESTAMP WHERE meal_uuid = ? AND deleted_at IS NULL",
      [meal_uuid],
    );

    const affectedRows = (result as any).affectedRows;
    if (affectedRows === 0) {
      throw new InternalServerError("Failed to delete meal!");
    }

    await connection.commit();
    connection.release();
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
};
