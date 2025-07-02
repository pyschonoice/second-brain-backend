import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Tag } from "../model/link-tag.model";
import { handleAuthError, handleZodError } from "../utils/errorHandler";

const createTagSchema = z.object({
  title: z.string().min(1, "Tag title is required."),
});

const getTagSchema = z.object({
  title: z.string().min(1, "Tag title is required."),
});

const deleteTagSchema = z.object({
  tagId: z
    .string()
    .refine(
      (val) => mongoose.Types.ObjectId.isValid(val),
      "Invalid Tag ID provided."
    ),
});

export const createTag = async (req: Request, res: Response): Promise<any> => {
  const { title } = createTagSchema.parse(req.body);
  const userId = req.userId;

  if (!userId) {
    return handleAuthError(res, "User not authenticated.");
  }

  const userIdObjectId = new mongoose.Types.ObjectId(userId);

  const existingTag = await Tag.findOne({ title, userId: userIdObjectId });
  if (existingTag) {
    return res.status(409).json({
      success: false,
      message: "Tag with this title already exists for this user.",
    });
  }

  const tag = await Tag.create({
    title,
    userId: userIdObjectId,
  });

  res.status(201).json({
    success: true,
    message: "Tag created successfully.",
    tag,
  });
};

export const getTag = async (req: Request, res: Response): Promise<any> => {
  const { title } = getTagSchema.parse(req.params);
  const userId = req.userId;

  if (!userId) {
    return handleAuthError(res, "User not authenticated.");
  }

  const userIdObjectId = new mongoose.Types.ObjectId(userId);

  const tag = await Tag.findOne({ title, userId: userIdObjectId });

  if (!tag) {
    return res.status(404).json({
      success: false,
      message: "Tag not found or you do not have permission to access it.",
    });
  }

  res.status(200).json({
    success: true,
    message: "Tag retrieved successfully.",
    tag,
  });
};

export const deleteTag = async (req: Request, res: Response): Promise<any> => {
  const { tagId } = deleteTagSchema.parse(req.body);
  const userId = req.userId;

  if (!userId) {
    return handleAuthError(res, "User not authenticated.");
  }

  const userIdObjectId = new mongoose.Types.ObjectId(userId);
  const tagObjectId = new mongoose.Types.ObjectId(tagId);

  const result = await Tag.deleteOne({
    _id: tagObjectId,
    userId: userIdObjectId,
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({
      success: false,
      message: "Tag not found or you do not have permission to delete it.",
    });
  }

  res.status(200).json({
    success: true,
    message: "Tag deleted successfully.",
  });
};
