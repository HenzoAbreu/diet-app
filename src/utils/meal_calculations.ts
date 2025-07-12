export function calculateTotalNutrition(
  foods: Array<{
    quantity: number;
    kcal_per_serving: number;
    carbs_per_serving: number;
    protein_per_serving: number;
    fat_per_serving: number;
  }>,
) {
  return foods.reduce(
    (total, food) => ({
      total_kcal:
        total.total_kcal + food.kcal_per_serving * (food.quantity / 100),
      total_carbs:
        total.total_carbs + food.carbs_per_serving * (food.quantity / 100),
      total_protein:
        total.total_protein + food.protein_per_serving * (food.quantity / 100),
      total_fat: total.total_fat + food.fat_per_serving * (food.quantity / 100),
    }),
    { total_kcal: 0, total_carbs: 0, total_protein: 0, total_fat: 0 },
  );
}

export function calculateNutrition(
  kcal_per_serving: number,
  carbs_per_serving: number,
  protein_per_serving: number,
  fat_per_serving: number,
  quantity_grams: number,
) {
  // Since serving is 100g, we calculate proportionally
  const multiplier = quantity_grams / 100;
  return {
    kcal: Math.round(kcal_per_serving * multiplier * 100) / 100,
    carbs: Math.round(carbs_per_serving * multiplier * 100) / 100,
    protein: Math.round(protein_per_serving * multiplier * 100) / 100,
    fat: Math.round(fat_per_serving * multiplier * 100) / 100,
  };
}
