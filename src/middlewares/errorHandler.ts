import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errors";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || "Something went wrong";
  const details =
    err instanceof ApiError && "details" in err
      ? (err as any).details
      : undefined;

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }), // Only include details if they exist
  });
};
