import express from "express";
import {
  getCart,
  syncCart,
  getWishlist,
  syncWishlist,
  removeFromCart,
} from "../controllers/cartController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= CART ================= */

// get user cart
router.get("/", authRequired, getCart);

// sync cart (add/update/remove in one call)
router.post("/sync", authRequired, syncCart);

// remove single item
router.delete("/:productId", authRequired, removeFromCart);

/* ================= WISHLIST ================= */

// get wishlist
router.get("/wishlist", authRequired, getWishlist);

// sync wishlist
router.post("/wishlist/sync", authRequired, syncWishlist);

export default router;

