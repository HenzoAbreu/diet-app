import { NextFunction, Request, Response } from "express";
import * as foodService from "../services/foodService";
import {
  NotFoundError,
  BadRequestError,
  ValidationError,
} from "../utils/errors";
import { CreateFoodRequest, UpdateFoodRequest } from "../models/foodModel";

export const getFoodByUUIDController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const food_uuid = req.params.food_uuid;

  const food = await foodService.getFoodByUUID(food_uuid);

  res.status(200).json({ success: true, data: food });
};

export const getAllFoodController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const foods = await foodService.getAllFood();

  res.status(200).json({ success: true, data: foods });
};

export const createFoodController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const foodData: CreateFoodRequest = req.body;
  if (!foodData) {
    throw new ValidationError("Please insert required information!");
  }

  const food = await foodService.createFood(foodData);
  res.status(201).json({ success: true, data: food });
};

export const updateFoodController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const food_uuid = req.params.food_uuid;

  const foodData: UpdateFoodRequest = req.body;
  const updatedFood = await foodService.updateFood(food_uuid, foodData);

  res.status(200).json({ success: true, data: updatedFood });
};

export const deleteFoodController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const food_uuid = req.params.food_uuid;
  await foodService.deleteFood(food_uuid);

  res.status(204).json({ success: true, data: null });
};
