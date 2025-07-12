import { User } from "../models/userModel";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import * as userRepo from "../repositories/userRepository";
import * as EmailValidator from "email-validator";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors";
import jwt from "jsonwebtoken";
import * as authentication from "../middlewares/authMiddleware";
import { z } from "zod";

async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}

export const updateUserService = async (
  user_uuid: string,
  updates: Partial<Pick<User, "full_name" | "email">>,
): Promise<User> => {
  const user = await userRepo.getUserByUuid(user_uuid);
  if (!user) {
    throw new NotFoundError("User not found!");
  }

  const updateUser = await userRepo.updateUser(user_uuid, updates);

  const updatedUser = await userRepo.getUserByUuid(user_uuid);
  if (!updatedUser) {
    throw new NotFoundError("User not found!");
  }

  return updatedUser;
};

export const deleteUserService = async (user_uuid: string): Promise<void> => {
  const user = await userRepo.getUserByUuid(user_uuid);
  if (!user) {
    throw new NotFoundError("User not found!");
  }
  await userRepo.deleteUser(user_uuid);
};

export const getAllUsersService = async (): Promise<User[]> => {
  const users = await userRepo.getAll();
  if (!users) {
    throw new NotFoundError("Users not found!");
  }
  return users;
};

export const getUserByUuidService = async (
  user_uuid: string,
): Promise<User> => {
  const user = await userRepo.getUserByUuid(user_uuid);
  if (!user) {
    throw new NotFoundError("User not found!");
  }
  return user;
};
