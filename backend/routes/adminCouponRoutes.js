import express from "express";
import {
  getAllCouponsAdmin,
  toggleCouponStatus,
  createCoupon,
} from "../controllers/couponController.js";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ADMIN ONLY */
router.get("/", authRequired, adminOnly, getAllCouponsAdmin);
router.patch("/:id/toggle", authRequired, adminOnly, toggleCouponStatus);
router.post("/", authRequired, adminOnly, createCoupon);
export default router;
