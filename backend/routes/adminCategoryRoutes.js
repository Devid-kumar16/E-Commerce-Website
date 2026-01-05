import express from "express";
import {
  listCategoriesAdmin,
  getCategoryAdmin,
  updateCategoryAdmin,
} from "../controllers/categoryController.js";

import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ================= ADMIN CATEGORY ROUTES
 * Base path: /api/admin/categories
 */

// ✅ Admin: list categories
router.get("/", authRequired, adminOnly, listCategoriesAdmin);

// ✅ Admin: get single category (THIS FIXES EDIT PAGE)
router.get("/:id", authRequired, adminOnly, getCategoryAdmin);

// ✅ Admin: update category
router.put("/:id", authRequired, adminOnly, updateCategoryAdmin);

export default router;

