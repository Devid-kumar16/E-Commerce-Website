import express from "express";
import {
  listCategories,
  createCategory,
} from "../controllers/categoryController.js";
import { authRequired, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* PUBLIC (or admin UI load) */
router.get("/", listCategories);

/* ADMIN ONLY */
router.post("/", authRequired, isAdmin, createCategory);

export default router;
