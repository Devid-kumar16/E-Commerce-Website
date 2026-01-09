import express from "express";
import {
  listCategories,
  listActiveCategories,
  createCategory,
  getCategory,
  updateCategory,
} from "../controllers/categoryController.js";

import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= PUBLIC ROUTES ================= */

// ✅ MUST BE FIRST
router.get("/active", listActiveCategories);

/* ================= ADMIN ROUTES ================= */

router.get("/admin", authRequired, adminOnly, listCategories);
router.post("/", authRequired, adminOnly, createCategory);

/* ================= ID ROUTES (keep last) ================= */

// GET one category
router.get("/:id", authRequired, adminOnly, getCategory);

// UPDATE category
router.put("/:id", authRequired, adminOnly, updateCategory);

export default router;
