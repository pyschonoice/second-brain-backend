import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware"; 
import { createTag, getTag, deleteTag } from "../controller/tag.controller"; 

const router = Router();

router.post("/tag", authMiddleware, createTag);
router.get("/tag/:title", authMiddleware, getTag);
router.delete("/tag", authMiddleware, deleteTag);

export default router;