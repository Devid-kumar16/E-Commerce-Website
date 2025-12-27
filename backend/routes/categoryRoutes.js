import express from "express";
import {
  listCategories,
  listActiveCategories,
  createCategory,
  getCategory,
  updateCategory,
} from "../controllers/categoryController.js";
import { authRequired,adminOnly  } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= PUBLIC ================= */

// 🔹 Used by Add/Edit Product page
router.get("/active", listActiveCategories);

/* ================= ADMIN ================= */

router.get("/", authRequired, adminOnly, listCategories);
router.post("/", authRequired, adminOnly, createCategory);
router.get("/:id", authRequired, adminOnly, getCategory);
router.put("/:id", authRequired, adminOnly, updateCategory);

export default router;
