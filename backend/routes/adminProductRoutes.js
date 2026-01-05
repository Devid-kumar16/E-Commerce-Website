import express from "express";
import {
  listAdminProducts,
  getProductAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  publishToggle,
} from "../controllers/productController.js";

import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ================= ADMIN PRODUCT ROUTES
 * Base path: /api/admin/products
 * Access: ADMIN ONLY
 */

// ✅ Admin: list all products
router.get("/", authRequired, adminOnly, listAdminProducts);

// ✅ Admin: create product
router.post("/", authRequired, adminOnly, createProduct);

// ✅ Admin: get single product (numeric id only)
router.get("/:id(\\d+)", authRequired, adminOnly, getProductAdmin);

// ✅ Admin: update product
router.put("/:id(\\d+)", authRequired, adminOnly, updateProduct);

// ✅ Admin: delete product
router.delete("/:id(\\d+)", authRequired, adminOnly, deleteProduct);

// ✅ Admin: publish / unpublish product
router.patch("/:id(\\d+)/publish", authRequired, adminOnly, publishToggle);

export default router;
