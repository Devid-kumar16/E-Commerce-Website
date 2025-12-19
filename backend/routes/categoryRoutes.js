import express from "express";
import {
  listCategories,
  createCategory,
  getCategory,
  updateCategory,
} from "../controllers/categoryController.js";
import { authRequired, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listCategories);
router.post("/", authRequired, isAdmin, createCategory);
router.get("/:id", authRequired, isAdmin, getCategory);
router.put("/:id", authRequired, isAdmin, updateCategory);

export default router;

