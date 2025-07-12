import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errors";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "super_jwt_secret";

interface JwtPayload {
  userId: number;
}

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
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT secret is not defined");

    const decoded = jwt.verify(token, secret) as JwtPayload;

    (req as any).user = decoded;

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const getIdfromToken = (token: string) => {
  if (!token) {
    throw new UnauthorizedError("Missing access token!");
  }
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET ?? "",
  ) as unknown as JwtPayload;
  return decoded.userId;
};
