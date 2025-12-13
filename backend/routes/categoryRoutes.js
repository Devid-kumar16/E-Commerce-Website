// backend/routes/categoryRoutes.js
import express from "express";
import {
  createCategory,
  updateCategory,
  listCategories,
  toggleCategoryActive,
  getCategory,
  listPublicCategories,
} from "../controllers/categoryController.js";

import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * Public routes (no auth required)
 */
router.get("/public", listPublicCategories);
router.get("/:id", getCategory);

/**
 * Admin routes (protected)
 */
router.use(verifyToken, isAdmin);
router.get("/", listCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.patch("/:id/active", toggleCategoryActive);

export default router;
