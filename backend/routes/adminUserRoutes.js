// backend/routes/adminUserRoutes.js
import express from "express";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";
import { promoteUser } from "../controllers/adminUserController.js";

const router = express.Router();

// Admin-only: promote/demote user
router.patch("/:id", authRequired, adminOnly, promoteUser);

export default router;
