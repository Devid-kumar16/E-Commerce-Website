import express from "express";
import {
  addCartItem,
  getCart,
  removeFromCart
} from "../controllers/cartController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authRequired, addCartItem);
router.get("/", authRequired, getCart);
router.delete("/:productId", authRequired, removeFromCart);

export default router;
