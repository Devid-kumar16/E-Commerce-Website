import express from "express";
import {
  getCart,
  syncCart,
  removeFromCart,
} from "../controllers/cartController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= CART ================= */

// GET /api/cart
router.get("/", authRequired, getCart);

// POST /api/cart/sync
router.post("/sync", authRequired, syncCart);

// DELETE /api/cart/:productId
router.delete("/:productId", authRequired, removeFromCart);

export default router;
