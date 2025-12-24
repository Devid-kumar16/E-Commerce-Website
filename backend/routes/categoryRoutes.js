import express from "express";
import {
  listCategories,
  listActiveCategories,
  createCategory,
  getCategory,
  updateCategory,
} from "../controllers/categoryController.js";
import { authRequired, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= PUBLIC ================= */

// 🔹 Used by Add/Edit Product page
router.get("/active", listActiveCategories);

/* ================= ADMIN ================= */

router.get("/", authRequired, isAdmin, listCategories);
router.post("/", authRequired, isAdmin, createCategory);
router.get("/:id", authRequired, isAdmin, getCategory);
router.put("/:id", authRequired, isAdmin, updateCategory);

export default router;
