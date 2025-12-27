import express from "express";
import {
  addWishlistItem,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= WISHLIST ================= */

// Add to wishlist (logged-in user)
router.post("/", authRequired, addWishlistItem);

// Get wishlist (logged-in user)
router.get("/", authRequired, getWishlist);

// Remove from wishlist (logged-in user)
router.delete("/:productId", authRequired, removeFromWishlist);

export default router;
