import { z } from "zod";
import { Request, Response } from "express";
import Content from "../model/content.model";
import { handleZodError, handleServerError } from "../utils/errorHandler";
import mongoose from "mongoose";


const createContentSchema = z.object({
  link: z.string(),
  typeofContent: z.enum(["link", "image", "video", "text"], {
    errorMap: () => ({ message: "Invalid content type. Must be 'link', 'image', 'video', or 'text'." })
  }).transform(val => val.trim()),
  title: z.string().min(1, "Title is required"),
  tags: z.array(z.string().refine(val => mongoose.Types.ObjectId.isValid(val), "Invalid Tag ID")).optional(),
});


const deleteContentSchema = z.object({
  contentId: z
    .string()
    .refine(
      (val) => mongoose.Types.ObjectId.isValid(val),
      "Invalid Content ID provided."
    ),
});

export const createContent = async (req: Request, res: Response): Promise<any>  => {
  try {
    
    const { link, typeofContent, title, tags } = createContentSchema.parse(req.body); 

    const userId = req.userId;

    if (!userId) {
       res.status(401).json({ success: false, message: "User not authenticated." });
       return;
    }
    const newContent = await Content.create({
      link,
      typeofContent,
      title,
      userId: new mongoose.Types.ObjectId(userId),
      // Map incoming tag strings to Mongoose ObjectIds
      tags: tags ? tags.map((tagId: string) => new mongoose.Types.ObjectId(tagId)) : [],
    });

     res.status(201).json({
      success: true,
      message: "Content added successfully.",
      contentId: newContent._id,
    });
    return;

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return handleZodError(res, error);
    }
    return handleServerError(res, error, "Failed to add content.");
  }
};

export const getContents = async (req: Request, res: Response): Promise<any>  => {
  try {
    const userId = req.userId;

    if (!userId) {
       res
        .status(401)
        .json({ success: false, message: "User not authenticated." });
        return;
    }

    const content = await Content.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .populate("userId", "username")
      .populate("tags", "title");

     res.status(200).json({
      success: true,
      content,
    });
    return;
  } catch (error: any) {
    return handleServerError(res, error, "Failed to retrieve content.");
  }
};

export const deleteContent = async (req: Request, res: Response): Promise<any>  => {
  try {
    const { contentId } = deleteContentSchema.parse(req.body);

    const userId = req.userId;

    if (!userId) {
       res
        .status(401)
        .json({ success: false, message: "User not authenticated." });
        return;
    }

    const result = await Content.deleteOne({
      _id: new mongoose.Types.ObjectId(contentId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
       res.status(404).json({
        success: false,
        message:
          "Content not found or you do not have permission to delete it.",
      });
      return;
    }

     res.status(200).json({
      success: true,
      message: "Content deleted successfully.",
    });
    return;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return handleZodError(res, error);
    }
    return handleServerError(res, error, "Failed to delete content.");
  }
};
