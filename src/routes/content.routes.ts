import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware"; 
import { createContent, getContents, deleteContent } from "../controller/content.controller"; 

const router = Router();

router.post("/content", authMiddleware, createContent);
router.get("/content", authMiddleware, getContents);
router.delete("/content", authMiddleware, deleteContent);

export default router;