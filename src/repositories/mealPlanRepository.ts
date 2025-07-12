import {
  CreateMealPlanRequest,
  MealPlan,
  UpdateMealPlanRequest,
} from "../models/mealPlanModel";
import { getPool } from "../db/dbConnect";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../utils/errors";

export const createMealPlan = async (
  mealPlanData: CreateMealPlanRequest,
  mealPlan_uuid: string,
  patient_id: number,
): Promise<MealPlan> => {
  const pool = getPool();
  const query = `INSERT INTO tb_meal_plan (name, description, meal_plan_uuid, patient_id) VALUES (?, ?, ?, ?);`;

  await pool.execute(query, [
    mealPlanData.name,
    mealPlanData.description || null,
    mealPlan_uuid,
    patient_id,
  ]);

  const [rows] = await pool.query(
    "SELECT meal_plan_id, meal_plan_uuid, name, description, patient_id, created_at, updated_at FROM tb_meal_plan WHERE meal_plan_uuid = ?;",
    [mealPlan_uuid],
  );
  const mealPlans = rows as any[];
  if (mealPlans.length === 0) {
    throw new InternalServerError("Failed to create Meal Plan!");
  }

  return mealPlans[0];
};

export const getMealPlanByUuid = async (
  meal_plan_uuid: string,
): Promise<MealPlan | null> => {
  const pool = getPool();
  const query =
    "SELECT meal_plan_id, meal_plan_uuid, name, description, patient_id, created_at, updated_at FROM tb_meal_plan WHERE meal_plan_uuid = ? AND deleted_at IS NULL;";

  const [result] = await pool.query(query, [meal_plan_uuid]);
  const mealPlans = result as any[];
  if (mealPlans.length === 0) {
    return null;
  }

  return mealPlans[0];
};

export const getAllMealPlans = async (): Promise<MealPlan[]> => {
  const pool = getPool();
  const query =
    "SELECT meal_plan_id, meal_plan_uuid, name, description, patient_id, created_at, updated_at FROM tb_meal_plan WHERE deleted_at IS NULL;";

  const [rows] = await pool.query(query);
  return rows as any[];
};

export const updateMealPlan = async (
  meal_plan_uuid: string,
  mealPlanUpdates: UpdateMealPlanRequest,
): Promise<MealPlan | null> => {
  const pool = getPool();
  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (mealPlanUpdates.name !== undefined) {
    if (mealPlanUpdates.name === "") {
      throw new BadRequestError("Field {name} cannot be empty!");
    }
    updateFields.push("name = ?");
    updateValues.push(mealPlanUpdates.name);
  }
  if (mealPlanUpdates.description !== undefined) {
    updateFields.push("description = ?");
    updateValues.push(mealPlanUpdates.description);
  }

  if (updateFields.length === 0) {
    throw new BadRequestError("No fields to update");
  }

  updateValues.push(meal_plan_uuid);

  const [result] = await pool.execute(
    `UPDATE tb_meal_plan SET ${updateFields.join(", ")} WHERE meal_plan_uuid = ? AND deleted_at IS NULL`,
    updateValues,
  );

  const updatedMealPlan = await getMealPlanByUuid(meal_plan_uuid);

  return updatedMealPlan;
};

export const deleteMealPlan = async (meal_plan_uuid: string): Promise<void> => {
  const pool = getPool();
  const [result] = await pool.execute(
    "UPDATE tb_meal_plan SET deleted_at = CURRENT_TIMESTAMP WHERE meal_plan_uuid = ? AND deleted_at IS NULL",
    [meal_plan_uuid],
  );

  const affectedRows = (result as any).affectedRows;
  if (affectedRows === 0) {
    throw new NotFoundError("Meal plan not found");
  }
};

export const getMealPlanDetail = async (
  meal_plan_uuid: string,
): Promise<{
  meal_plan: MealPlan & { patient_uuid: string };
  meals: Array<{
    meal: any;
    foods: Array<{
      food: any;
      quantity: number;
    }>;
  }>;
} | null> => {
  const pool = getPool();
  // get meal plan info
  const [mealPlanRows] = await pool.execute(
    `
    SELECT mp.meal_plan_id, mp.meal_plan_uuid, mp.name, mp.description, mp.created_at, mp.updated_at, p.patient_uuid
    FROM tb_meal_plan mp
    JOIN tb_patient p ON mp.patient_id = p.patient_id
    WHERE mp.meal_plan_uuid = ? AND mp.deleted_at IS NULL
    ;`,
    [meal_plan_uuid],
  );

  const mealPlans = mealPlanRows as any[];
  if (mealPlans.length === 0) {
    return null;
  }

  const mealPlan = mealPlans[0];

  // get meals from plan
  const [mealRows] = await pool.execute(
    `
    SELECT meal_id, meal_uuid, name, description, meal_plan_id, meal_order, created_at, updated_at
    FROM tb_meal 
    WHERE meal_plan_id = ? AND deleted_at IS NULL
    ORDER BY meal_order, name
    ;`,
    [mealPlan.meal_plan_id],
  );

  const meals = mealRows as any[];
  const mealsWithFoods: Array<{
    meal: any;
    foods: Array<{
      food: any;
      quantity: number;
    }>;
  }> = [];

  // get foods from each meal
  for (const meal of meals) {
    const [foodRows] = await pool.execute(
      `
      SELECT f.food_id, f.food_uuid, f.food_name, f.kcal_per_serving, f.carbs_per_serving, f.protein_per_serving, f.fat_per_serving, f.created_at, f.updated_at, mf.quantity
      FROM tb_food f
      JOIN tb_meal_food mf ON mf.food_id = f.food_id
      WHERE mf.meal_id = ? AND f.deleted_at IS NULL
      ORDER BY f.food_name
      ;`,
      [meal.meal_id],
    );
    const foods = (foodRows as any[]).map((row: any) => ({
      food: {
        ...row,
        kcal_per_serving: Number(row.kcal_per_serving),
        carbs_per_serving: Number(row.carbs_per_serving),
        protein_per_serving: Number(row.protein_per_serving),
        fat_per_serving: Number(row.fat_per_serving),
      },
      quantity: Number(row.quantity),
    }));

    mealsWithFoods.push({
      meal,
      foods,
    });
  }
  return {
    meal_plan: mealPlan,
    meals: mealsWithFoods,
  };
};

export const getMealPlanWithMealsCount = async (
  meal_plan_uuid: string,
): Promise<
  (MealPlan & { meals_count: number; patient_uuid: string }) | null
> => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT mp.meal_plan_id, mp.meal_plan_uuid, mp.name, mp.description, mp.patient_id, mp.created_at, mp.updated_at, mp.deleted_at,
     p.patient_uuid,
     COUNT(m.meal_id) as meals_count
     FROM tb_meal_plan mp
     JOIN tb_patient p ON mp.patient_id = p.patient_id
     LEFT JOIN tb_meal m ON mp.meal_plan_id = m.meal_plan_id AND m.deleted_at IS NULL
     WHERE mp.meal_plan_uuid = ? AND mp.deleted_at IS NULL
     GROUP BY mp.meal_plan_id`,
    [meal_plan_uuid],
  );

  const mealPlans = rows as any[];
  if (mealPlans.length === 0) {
    return null;
  }

  return {
    ...mealPlans[0],
    meals_count: Number(mealPlans[0].meals_count),
  };
};
