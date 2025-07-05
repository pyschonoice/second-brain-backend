// src/routes/preview.routes.ts
import { Router } from 'express';
import { getLinkPreview } from '../controller/preview.controller';
import { authMiddleware } from "../middleware/auth.middleware"; 
const router = Router();

// Define the route for fetching link previews
// This will be accessible at /api/v1/preview-link
router.get('/preview-link', authMiddleware,getLinkPreview);

export default router;