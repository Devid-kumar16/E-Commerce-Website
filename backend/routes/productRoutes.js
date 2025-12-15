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
} from "../controllers/productController.js";

import { authRequired, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------------- ADMIN (FIRST!) ---------------- */

// GET /api/products/admin/list
router.get("/admin/list", authRequired, isAdmin, listAdminProducts);

// POST /api/products/admin
router.post("/admin", authRequired, isAdmin, createProduct);

// PUT /api/products/admin/:id
router.put("/admin/:id", authRequired, isAdmin, updateProduct);

// DELETE /api/products/admin/:id
router.delete("/admin/:id", authRequired, isAdmin, deleteProduct);

// PATCH /api/products/admin/:id/publish
router.patch("/admin/:id/publish", authRequired, isAdmin, publishToggle);

// PATCH /api/products/admin/:id/inventory
router.patch("/admin/:id/inventory", authRequired, isAdmin, updateInventory);

/* ---------------- PUBLIC ---------------- */

// GET /api/products
router.get("/", listPublicProducts);

// GET /api/products/:id
router.get("/:id", getProduct);

export default router;
