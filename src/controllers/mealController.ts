import { NextFunction, Request, Response } from "express";
import {
  createMealService,
  getAllMealsService,
  getAllMealsFromMealPlanService,
  getMealByUuidService,
  updateMealService,
  deleteMealService,
} from "../services/mealService";
import { CreateMealRequest, UpdateMealRequest } from "../models/mealModel";
import {
  NotFoundError,
  BadRequestError,
  ValidationError,
  UnauthorizedError,
} from "../utils/errors";
import { validate as uuidValidate, version as uuidVersion } from "uuid";
import { UpdateMealPlanRequest } from "../models/mealPlanModel";

export const createMealController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const mealData: CreateMealRequest = req.body;
  if (!mealData.name || !mealData.meal_plan_uuid) {
    throw new BadRequestError("Please insert required information!");
  }
  try {
    const meal = await createMealService(mealData);

    res.status(201).json({ success: true, data: meal });
  } catch (err) {
    next(err);
  }
};

export const getAllMealsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const meals = await getAllMealsService();

    res.status(200).json({ success: true, data: meals });
  } catch (err) {
    next(err);
  }
};

export const getAllMealsFromMealPlanController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { meal_plan_id } = req.params;
  try {
    const meals = await getAllMealsFromMealPlanService(parseInt(meal_plan_id));

    res.status(200).json({ success: true, data: meals });
  } catch (err) {
    next(err);
  }
};

export const getMealByUuidController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { meal_uuid } = req.params;
  try {
    const meal = await getMealByUuidService(meal_uuid);

    res.status(200).json({ success: true, data: meal });
  } catch (err) {
    next(err);
  }
};

export const updateMealController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { meal_uuid } = req.params;
  const mealData: UpdateMealRequest = req.body;
  try {
    const updatedMeal = await updateMealService(meal_uuid, mealData);

    res.status(201).json({ success: true, data: updatedMeal });
  } catch (err) {
    next(err);
  }
};

export const deleteMealController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { meal_uuid } = req.params;
  try {
    await deleteMealService(meal_uuid);

    res
      .status(200)
      .json({ success: true, message: "Meal deleted successfully!" });
  } catch (err) {
    next(err);
  }
};
