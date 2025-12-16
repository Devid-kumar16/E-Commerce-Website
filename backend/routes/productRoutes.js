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

// ✅ LIST products (admin)
router.get("/admin/list", authRequired, isAdmin, listAdminProducts);

// ✅ GET single product (admin) 🔥 ADD THIS
router.get("/admin/:id", authRequired, isAdmin, getProduct);

// ✅ CREATE product
router.post("/admin", authRequired, isAdmin, createProduct);

// ✅ UPDATE product
router.put("/admin/:id", authRequired, isAdmin, updateProduct);

// ✅ DELETE product
router.delete("/admin/:id", authRequired, isAdmin, deleteProduct);

// ✅ PUBLISH toggle
router.patch("/admin/:id/publish", authRequired, isAdmin, publishToggle);

// ✅ INVENTORY update
router.patch("/admin/:id/inventory", authRequired, isAdmin, updateInventory);

/* ---------------- PUBLIC ---------------- */

// GET /api/products
router.get("/", listPublicProducts);

// GET /api/products/:id
router.get("/:id", getProduct);

export default router;
