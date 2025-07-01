import { Response } from "express";
import { z } from "zod";

interface ValidationError {
  field: string | (string | number)[];
  message: string;
}

export const handleZodError = (res: Response, error: z.ZodError) => {
  const errors: ValidationError[] = error.errors.map((err) => ({
    field: err.path,
    message: err.message,
  }));

  return res.status(400).json({
    success: false,
    message: "Validation failed.",
    errors: errors,
  });
};

export const handleMongooseError = (res: Response, error: any) => {
  if (error.code === 11000 && error.keyPattern) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } already exists.`,
    });
  }

  console.error("Mongoose error:", error);
  return res.status(500).json({
    success: false,
    message: "A database error occurred.",
  });
};

export const handleServerError = (
  res: Response,
  error: any,
  customMessage: string = "An unexpected error occurred."
) => {
  console.error("Server error:", error);
  return res.status(500).json({
    success: false,
    message: customMessage,
  });
};

export const handleAuthError = (
  res: Response,
  message: string = "Authentication failed."
) => {
  return res.status(401).json({
    success: false,
    message: message,
  });
};
