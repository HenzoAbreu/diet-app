import { NextFunction, Request, Response } from "express";
import * as authService from "../services/authService";
import {
  NotFoundError,
  BadRequestError,
  ValidationError,
} from "../utils/errors";
import {
  PublicUser,
  SigninRequest,
  SignupRequest,
  User,
} from "../models/userModel";

// convert to public repsonse
const toPublicUser = (user: User): PublicUser => {
  return {
    user_uuid: user.user_uuid,
    full_name: user.full_name,
    email: user.email,
  };
};

export const signupController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userData: SignupRequest = req.body;
  if (!userData) {
    throw new BadRequestError("Please insert all information required!");
  }
  const result = await authService.signup(userData);

  res.status(201).json({
    success: true,
    data: { user: toPublicUser(result.user), token: result.token },
  });
};

export const signinController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userData: SigninRequest = req.body;
  if (!userData) {
    throw new BadRequestError("Please insert all information required!");
  }
  const result = await authService.signin(userData);

  res.status(201).json({
    success: true,
    data: { user: toPublicUser(result.user), token: result.token },
  });
};
