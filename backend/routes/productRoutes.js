import express from "express";
import {
  listPublicProducts,
  listAdminProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  publishToggle,
  updateInventory,
  getProductsByCategory,
} from "../controllers/productController.js";

import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= ADMIN ROUTES (FIRST) ================= */

// Admin product list
router.get("/admin/list", authRequired, adminOnly, listAdminProducts);

// Admin single product
router.get("/admin/:id", authRequired, adminOnly, getProduct);

// Create product
router.post("/admin", authRequired, adminOnly, createProduct);

// Update product
router.put("/admin/:id", authRequired, adminOnly, updateProduct);

// Delete product
router.delete("/admin/:id", authRequired, adminOnly, deleteProduct);

// Publish / Unpublish
router.patch("/admin/:id/publish", authRequired, adminOnly, publishToggle);

// Inventory update
router.patch("/admin/:id/inventory", authRequired, adminOnly, updateInventory);

/* ================= PUBLIC ROUTES ================= */

// Category-wise products (MUST be before :id)
router.get("/category/:slug", getProductsByCategory);

// Public product list (HOME PAGE)
router.get("/", listPublicProducts);

// Public single product (optional, OK to keep)
router.get("/:id", getProduct);

export default router;
