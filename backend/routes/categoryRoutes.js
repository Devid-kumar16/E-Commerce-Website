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

/* ================= ADMIN ROUTES ================= */

// 🔹 Admin: list ALL categories (FIXED)
router.get("/admin", authRequired, adminOnly, listCategories);

// 🔹 Admin: create category
router.post("/", authRequired, adminOnly, createCategory);

// 🔹 Admin: get single category
router.get("/:id", authRequired, adminOnly, getCategory);

// 🔹 Admin: update category
router.put("/:id", authRequired, adminOnly, updateCategory);

/* ================= PUBLIC ROUTES ================= */

// 🔹 Public: active categories (navbar, public pages)
router.get("/active", listActiveCategories);

export default router;
