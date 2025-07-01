import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware"; 
import { shareBrain, getSharedBrain } from "../controller/brain.controller"; 

const router = Router();

// Route to create/remove a share link (requires authentication)
router.post("/brain/share", authMiddleware, shareBrain);

// Route to access shared content via hash (public, no authMiddleware)
router.get("/brain/:shareLink", getSharedBrain);

export default router;