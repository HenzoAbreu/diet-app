import { CreateFoodRequest, Food } from "../models/foodModel";
import { MealFood } from "../models/mealModel";
import { getPool } from "../db/dbConnect";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { InternalServerError, NotFoundError } from "../utils/errors";

const convertDbRowToFood = (row: any): Food => ({
  ...row,
  kcal_per_serving: Number(row.kcal_per_serving),
  carbs_per_serving: Number(row.carbs_per_serving),
  protein_per_serving: Number(row.protein_per_serving),
  fat_per_serving: Number(row.fat_per_serving),
});

export const getFoodByUuid = async (
  food_uuid: string,
): Promise<Food | null> => {
  const pool = getPool();
  const query = `
    SELECT 
     food_id,
     food_uuid,
     food_name,
     kcal_per_serving,
     carbs_per_serving,
     protein_per_serving,
     fat_per_serving
    FROM 
     tb_food 
    WHERE 
     food_uuid = ? AND deleted_at IS NULL`;
  const [rows] = await pool.execute(query, [food_uuid]);

  // convert to numbers
  const foods = (rows as any[]).map(convertDbRowToFood);
  if (foods.length === 0) {
    return null;
  }
  return foods[0];
};

export const getAllFood = async (): Promise<Food[]> => {
  const pool = getPool();
  const query = `
    SELECT
     food_uuid,
     food_name,
     kcal_per_serving,
     carbs_per_serving,
     protein_per_serving,
     fat_per_serving
    FROM
     tb_food
    WHERE 
    deleted_at IS NULL
    `;

  const [rows] = await pool.execute(query);

  // convert numeric fieds to numbers
  const foods = (rows as any[]).map(convertDbRowToFood);
  // service already handles error below
  // if (foods.length === 0) {
  //   throw new NotFoundError(`Food not found`);
  // }
  return foods;
};

export const createFood = async (
  foodData: CreateFoodRequest,
): Promise<Food | null> => {
  const pool = getPool();
  const query = `
    INSERT INTO tb_food (food_uuid, food_name, kcal_per_serving, carbs_per_serving, protein_per_serving, fat_per_serving)
    VALUES (?, ?, ?, ?, ?, ?);
    `;

  const [result] = await pool.execute(query, [
    foodData.food_uuid,
    foodData.food_name,
    foodData.kcal_per_serving,
    foodData.carbs_per_serving,
    foodData.protein_per_serving,
    foodData.fat_per_serving,
  ]);

  // Return inserted food
  const [rows] = await pool.execute(
    "SELECT food_id, food_uuid, food_name, kcal_per_serving, carbs_per_serving, protein_per_serving, fat_per_serving FROM tb_food WHERE food_uuid = ? AND deleted_at IS NULL;",
    [foodData.food_uuid],
  );
  const foods = rows as any[];
  if (foods.length === 0) {
    throw new InternalServerError("Failed to create food!");
  }
  return foods[0];
};

export const updateFoodByUuid = async (
  food_uuid: string,
  updates: Partial<Food>,
): Promise<Food | null> => {
  const pool = getPool();
  const fields = Object.keys(updates);
  if (fields.length === 0) return null;

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => (updates as any)[field]);

  const query = `UPDATE tb_food SET ${setClause} WHERE food_uuid = ?;`;

  await pool.execute(query, [...values, food_uuid]);

  // Return update food
  const updatedFood = await getFoodByUuid(food_uuid);
  if (!updatedFood) {
    return null;
  }

  return updatedFood;
};

export const deleteFood = async (food_uuid: string): Promise<void> => {
  const pool = getPool();
  const q = `
    UPDATE tb_food SET deleted_at = NOW() WHERE food_uuid = ? AND deleted_at IS NULL
    ;`;

  const [result] = await pool.execute(q, [food_uuid]);
  const affectedRows = (result as any).affectedRows;
  if (affectedRows === 0) {
    throw new InternalServerError("Failed to delete food!");
  }
};

////////////////////

// export const getFoodsByUUIDs = async (uuids: string[]): Promise<[MealFood]> => {
//   const pool = getPool();
//   const q = `
//     SELECT  name, calories, protein, carbs, fat FROM tb_food WHERE uuid IN (?) AND deleted_at IS NULL
//     ;`;
//   const [rows] = await pool.execute(q, [uuids]);
//   return rows as [MealFood];
// };
