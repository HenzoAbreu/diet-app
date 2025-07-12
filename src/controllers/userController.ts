import { NextFunction, Request, Response } from "express";
import * as userService from "../services/userService";
import {
  NotFoundError,
  BadRequestError,
  ValidationError,
} from "../utils/errors";
import { PublicUser, User } from "../models/userModel";

const toPublicUser = (user: User): PublicUser => {
  return {
    user_uuid: user.user_uuid,
    full_name: user.full_name,
    email: user.email,
  };
};

export const getAllUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await userService.getAllUsersService();

  res.status(200).json({ success: true, data: result.map(toPublicUser) });
};

export const getUserByUuidController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user_uuid = req.params.user_uuid;
  if (!user_uuid) {
    throw new BadRequestError("Please provide a valid user UUID!");
  }
  const result = await userService.getUserByUuidService(user_uuid);
  res.status(200).json({ success: true, data: toPublicUser(result) });
};

export const updateUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user_uuid = req.params.user_uuid;
  const updates = req.body;
  if (!user_uuid) {
    throw new BadRequestError("Please provide a valid user UUID!");
  }

  const updatedUser = await userService.updateUserService(user_uuid, updates);
  res.status(200).json({ success: true, data: toPublicUser(updatedUser) });
};

export const deleteUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user_uuid = req.params.user_uuid;
  if (!user_uuid) {
    throw new BadRequestError("Please provide a valid user UUID!");
  }
  await userService.deleteUserService(user_uuid);

  res.status(200).json({ success: true, message: "User deleted successfully" });
};
