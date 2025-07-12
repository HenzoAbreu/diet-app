import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errors";
import dotenv from "dotenv";
dotenv.config();

interface JwtPayload {
  user?: {
    user_id: number;
    user_uuid: string;
    email: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "super_jwt_secret";

export const generateToken = (uuid: string): string => {
  if (!uuid) {
    throw new UnauthorizedError("Failed to generate access token!");
  }
  const token = jwt.sign({ uuid }, JWT_SECRET, {
    expiresIn: "8h",
  });
  return token;
};

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    throw new UnauthorizedError("Missing access token!");
  }

  try {
    if (!JWT_SECRET) throw new Error("JWT secret is not defined");

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    (req as any).user = decoded;

    next();
  } catch (err) {
    throw new UnauthorizedError("Token verification failed!");
  }
};
