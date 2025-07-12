import { calculateTotalNutrition } from "../utils/meal_calculations";

describe("Meal Calculations", () => {
  describe("calculateTotalNutrition", () => {
    it("should calculate total nutrition for one food item", () => {
      // Arrange: Set up our test data
      const foods = [
        {
          quantity: 100, // 100 grams
          kcal_per_serving: 52,
          carbs_per_serving: 14,
          protein_per_serving: 0.3,
          fat_per_serving: 0.2,
        },
      ];

      // Act: Call the function we want to test
      const result = calculateTotalNutrition(foods);

      // Assert: Check if the result is what we expect
      expect(result.total_kcal).toBe(52);
      expect(result.total_carbs).toBe(14);
      expect(result.total_protein).toBe(0.3);
      expect(result.total_fat).toBe(0.2);
    });

    it("should calculate total nutrition for multiple food items", () => {
      // Arrange: Set up test data with two foods
      const foods = [
        {
          quantity: 100, // 100 grams
          kcal_per_serving: 52,
          carbs_per_serving: 14,
          protein_per_serving: 0.3,
          fat_per_serving: 0.2,
        },
        {
          quantity: 50, // 50 grams
          kcal_per_serving: 89,
          carbs_per_serving: 23,
          protein_per_serving: 1.1,
          fat_per_serving: 0.3,
        },
      ];

      // Act: Call the function
      const result = calculateTotalNutrition(foods);

      // Assert: Check the calculations
      // First food: 52 * (100/100) = 52 kcal
      // Second food: 89 * (50/100) = 44.5 kcal
      // Total: 52 + 44.5 = 96.5 kcal
      expect(result.total_kcal).toBe(96.5);

      // First food: 14 * (100/100) = 14 carbs
      // Second food: 23 * (50/100) = 11.5 carbs
      // Total: 14 + 11.5 = 25.5 carbs
      expect(result.total_carbs).toBe(25.5);
    });
  });
});
