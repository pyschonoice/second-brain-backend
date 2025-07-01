import { Request, Response } from 'express';
import { z } from "zod";
import User from "../model/user.model";

const userAuthSchema = z.object({
  username: z.string().toLowerCase().trim().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = userAuthSchema.parse(req.body);

    await User.create({ username, password });

     res.status(201).json({
      message: "User signed up successfully."
    });
    return;

  } catch (error: any) {
    if (error instanceof z.ZodError) {
       res.status(400).json({
        message: "Validation failed.",
        errors: error.errors.map(e => e.message)
      });
      return;
    } else if (error.code === 11000) {
       res.status(409).json({ message: "User already exists." });
       return;
    } else {
      console.error("Signup error:", error);
       res.status(500).json({
        message: "An error occurred during signup."
      });
      return;
    }
  }
};

export const signin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = userAuthSchema.parse(req.body);

    const user = await User.findOne({ username });

    if (!user || !(await user.isPasswordValid(password))) {
       res.status(401).json({ message: "Incorrect username or password." });
       return;
    }

    const accessToken = user.generateAccessToken();

     res.status(200).json({
      message: "Login successful.",
      accessToken
    });
    return;

  } catch (error: any) {
    if (error instanceof z.ZodError) {
       res.status(400).json({
        message: "Validation failed.",
        errors: error.errors.map(e => e.message)
      });
      return;
    } else {
      console.error("Signin error:", error);
       res.status(500).json({
        message: "An error occurred during signin."
      });
      return;
    }
  }
};
