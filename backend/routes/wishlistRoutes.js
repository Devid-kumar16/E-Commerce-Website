import express from "express";
import {
  addWishlistItem,
  getWishlist,
  removeFromWishlist
} from "../controllers/wishlistController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authRequired, addWishlistItem);
router.get("/", authRequired, getWishlist);
router.delete("/:productId", authRequired, removeFromWishlist);

export default router;
