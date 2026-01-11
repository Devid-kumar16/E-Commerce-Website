import express from "express";
import {
  applyCoupon,
  getAvailableCoupons
} from "../controllers/couponController.js";

import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply coupon (user must be logged in)
router.post("/apply", authRequired, applyCoupon);

// Get all active + valid coupons for checkout
router.get("/available", getAvailableCoupons);

export default router;
