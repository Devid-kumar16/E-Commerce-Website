import express from "express";
import {
  listPublicProducts,
  getProduct,
  getProductsByCategory,
} from "../controllers/productController.js";

const router = express.Router();

/**
 * ================= PUBLIC PRODUCT ROUTES
 * Base path: /api/products
 */

// Public product list
router.get("/", listPublicProducts);

// Category products
router.get("/category/:slug", getProductsByCategory);

// Public single product
router.get("/:id(\\d+)", getProduct);

export default router;
