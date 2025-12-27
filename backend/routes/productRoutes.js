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
  getProductsByCategory, // ✅ ADD THIS
} from "../controllers/productController.js";

import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------------- ADMIN (FIRST!) ---------------- */

router.get("/admin/list", authRequired, adminOnly, listAdminProducts);
router.get("/admin/:id", authRequired, adminOnly, getProduct);
router.post("/admin", authRequired, adminOnly, createProduct);
router.put("/admin/:id", authRequired, adminOnly, updateProduct);
router.delete("/admin/:id", authRequired, adminOnly, deleteProduct);
router.patch("/admin/:id/publish", authRequired, adminOnly, publishToggle);
router.patch("/admin/:id/inventory", authRequired, adminOnly, updateInventory);

/* ---------------- PUBLIC ---------------- */

// ✅ CATEGORY PRODUCTS (MUST BE ABOVE /:id)
router.get("/category/:slug", getProductsByCategory);

// GET /api/products
router.get("/", listPublicProducts);

// GET /api/products/:id
router.get("/:id", getProduct);

export default router;
