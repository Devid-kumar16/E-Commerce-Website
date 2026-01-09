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

/* =====================================================
   ✅ ADMIN PRODUCT ROUTES
   Base path: /api/products/admin
===================================================== */

// ➕ Create product (ADMIN)
router.post("/admin", authRequired, adminOnly, createProduct);

// 📦 Admin product list (ALL products with pagination)
router.get("/admin", authRequired, adminOnly, getAdminProducts);

// ✏️ Update product (ADMIN)
router.put("/admin/:id", authRequired, adminOnly, updateProduct);

// 🗑️ Delete product (ADMIN)
router.delete("/admin/:id", authRequired, adminOnly, deleteProduct);


/* =====================================================
   ✅ PUBLIC PRODUCT ROUTES
   Base path: /api/products
===================================================== */

// 🌍 Public product list (ONLY published)
router.get("/", listPublicProducts);

// 📂 Products by category
router.get("/category/:slug", getProductsByCategory);

// 🔍 Public single product
router.get("/:id(\\d+)", getProduct);

export default router;
