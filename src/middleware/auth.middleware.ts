import { NextFunction, Response, Request } from "express";
import jwt, {
  JwtPayload,
} from "jsonwebtoken";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.status(401).json({
      success: false,
      message: "Authorization token missing. Please log in.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Token format invalid. Expected 'Bearer <token>'.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY!);

    if (typeof decoded === "string") {
      res.status(403).json({
        success: false,
        message: "Invalid token payload format.",
      });
      return; 
    }

    req.userId = (decoded as JwtPayload)._id;

    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred during authentication.",
    });
    return;
  }
};
