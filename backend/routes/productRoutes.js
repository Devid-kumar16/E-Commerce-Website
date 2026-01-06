import express from "express";
import {
  listPublicProducts,
  getProduct,
  getProductsByCategory,
  createProduct,
  getAdminProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ================= ADMIN PRODUCT ROUTES
 * Base path: /api/products
 */

// ➕ Create product (ADMIN)
router.post("/", authRequired, adminOnly, createProduct);

// 📦 Admin product list (ALL products)
router.get("/admin", authRequired, adminOnly, getAdminProducts);

// ✏️ Update product (ADMIN)
router.put("/:id", authRequired, adminOnly, updateProduct);

// 🗑️ Delete product (ADMIN)
router.delete("/:id", authRequired, adminOnly, deleteProduct);

/**
 * ================= PUBLIC PRODUCT ROUTES
 */

// 🌍 Public product list (ONLY published)
router.get("/", listPublicProducts);

// 📂 Products by category
router.get("/category/:slug", getProductsByCategory);

// 🔍 Public single product
router.get("/:id(\\d+)", getProduct);

router.post(
  "/admin",
  authRequired,
  adminOnly,
  createProduct
);

export default router;

