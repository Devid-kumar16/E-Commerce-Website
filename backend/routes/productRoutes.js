// backend/routes/productRoutes.js
import express from "express";
import {
  listPublicProducts,
  listAdminProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  publishToggle,
  activeToggle,
  updateInventory
} from "../controllers/productController.js";

import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

/* --------------------
   PUBLIC ROUTES (no auth)
   GET /api/products
   GET /api/products/:id
   -------------------- */
router.get("/", listPublicProducts);
router.get("/:id", getProduct);

/* --------------------
   ADMIN ROUTES (protected)
   We support both:
     - root-level admin routes (POST /api/products, PUT /api/products/:id, DELETE /api/products/:id)
     - legacy /admin/* routes (for any tools or scripts expecting them)
   All admin routes require verifyToken + isAdmin.
   -------------------- */

// Root-level admin CRUD (so POST /api/products works)
router.post("/", verifyToken, isAdmin, createProduct);
router.put("/:id", verifyToken, isAdmin, updateProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

// Admin namespace (kept for backward compatibility)
// Apply auth middleware to any /admin/* route
router.use("/admin", verifyToken, isAdmin);

// List for admin (accessible as GET /api/products/admin/list)
router.get("/admin/list", listAdminProducts);

// Legacy admin CRUD (accessible as POST /api/products/admin, etc.)
router.post("/admin", createProduct);
router.put("/admin/:id", updateProduct);
router.delete("/admin/:id", deleteProduct);

// Publish / active / inventory toggles (admin)
router.patch("/admin/:id/publish", publishToggle);
router.patch("/admin/:id/active", activeToggle);
router.patch("/admin/:id/inventory", updateInventory);

export default router;
