export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request
export class BadRequestError extends ApiError {
  constructor(message = "Bad request") {
    super(400, message);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

// 403 Forbidden
export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

// 404 Not Found
export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

// 422 Unprocessable Entity (Validation Errors)
export class ValidationError extends ApiError {
  details: any;

  constructor(message = "Validation error", details?: any) {
    super(422, message);
    this.details = details;
  }
}

// 500 Internal Server Error
export class InternalServerError extends ApiError {
  constructor(message = "Internal server error") {
    super(500, message);
  }
}

// 409 Conflict Error
export class ConflictError extends ApiError {
  constructor(message = "Resource already exists") {
    super(409, message);
  }
}
