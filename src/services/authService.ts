import { SigninRequest, SignupRequest, User } from "../models/userModel";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import * as userRepo from "../repositories/userRepository";
import * as EmailValidator from "email-validator";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors";
import jwt from "jsonwebtoken";
import * as authentication from "../middlewares/authMiddleware";
import { z } from "zod";

////////////

async function verifyPassword(
  password: string,
  salt: string,
  hashedPassword: string,
) {
  return await bcrypt.compare(password + salt, hashedPassword);
}

const UserSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long!"),
});

export const signup = async (
  userData: SignupRequest,
): Promise<{ user: User; token: string }> => {
  const userInput = {
    full_name: userData.full_name,
    email: userData.email.trim(),
    password: userData.password,
  };
  // Validation
  const parsed = await UserSchema.safeParse(userInput);
  if (!parsed.success) {
    throw new ValidationError("Invalid user data!", parsed.error.flatten());
  }

  // Check if user already exists
  const userExists = await userRepo.getUserByEmail(parsed.data.email);
  if (userExists) {
    throw new ConflictError("Email already registered");
  }

  // Generate uuid
  const user_uuid = uuidv4();

  // Password salting
  const salt = uuidv4();
  const hashedPassword = bcrypt.hashSync(parsed.data.password + salt, 12);

  const user = await userRepo.createUser(
    parsed.data.full_name,
    user_uuid,
    parsed.data.email,
    hashedPassword,
    salt,
  );
  if (!user) {
    throw new InternalServerError("Failed to create user!");
  }

  const token = await authentication.generateToken(user_uuid);

  return { user, token };
};

export const signin = async (
  userData: SigninRequest,
): Promise<{ user: User; token: string }> => {
  // Validation
  // no need for zod?, invalid email will fail below

  // Check if email is registered
  const user = await userRepo.getUserByEmail(userData.email);
  if (!user) {
    throw new BadRequestError("Invalid email or password!");
  }

  // validate password
  const validCredentials = await verifyPassword(
    userData.password,
    user.password_salt,
    user.password,
  );
  if (!validCredentials) {
    throw new BadRequestError("Invalid email or password!");
  }

  // sign an return jwt token
  const token = await authentication.generateToken(user.user_uuid);

  return { user, token };
};
