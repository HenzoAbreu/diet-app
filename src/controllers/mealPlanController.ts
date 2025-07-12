import { Request, Response, NextFunction } from "express";
import {
  CreateMealPlanRequest,
  UpdateMealPlanRequest,
} from "../models/mealPlanModel";
import {
  createMealPlanService,
  getMealPlanService,
  getAllMealPlansService,
  updateMealPlanService,
  deleteMealPlanService,
  getMealPlanDetailsService,
} from "../services/mealPlanService";
import { BadRequestError } from "../utils/errors";

export const createMealPlanController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const mealPlanData: CreateMealPlanRequest = req.body;

  try {
    const mealPlan = await createMealPlanService(mealPlanData);
    res.status(200).json({ success: true, data: mealPlan });
  } catch (err) {
    next(err);
  }
};

export const getMealPlanController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { meal_plan_uuid } = req.params;

  try {
    const mealPlan = await getMealPlanService(meal_plan_uuid);
    res.status(200).json({ success: true, data: mealPlan });
  } catch (err) {
    next(err);
  }
};

export const getMealPlanDetailsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { meal_plan_uuid } = req.params;
  try {
    const mealPlanDetails = await getMealPlanDetailsService(meal_plan_uuid);

    res.status(200).json({ success: true, data: mealPlanDetails });
  } catch (err) {
    next(err);
  }
};

export const getAllMealPlansController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const mealPlans = await getAllMealPlansService();

    res.status(200).json({ success: true, data: mealPlans });
  } catch (err) {
    next(err);
  }
};

export const updateMealPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { meal_plan_uuid } = req.params;
  const mealPlanUpdates: UpdateMealPlanRequest = req.body;
  try {
    const updatedMealPlan = await updateMealPlanService(
      meal_plan_uuid,
      mealPlanUpdates,
    );

    res.status(204).json({ success: true, data: updatedMealPlan });
  } catch (err) {
    next(err);
  }
};

export const deleteMealPlanController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { meal_plan_uuid } = req.params;

  try {
    await deleteMealPlanService(meal_plan_uuid);

    res.status(200).json("Meal Plan deleted successfully!");
  } catch (err) {
    next(err);
  }
};
