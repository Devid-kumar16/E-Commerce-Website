import express from "express";
import { applyCoupon,
         getAvailableCoupons
} from "../controllers/couponController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/apply", authRequired, applyCoupon);
router.get("/available", getAvailableCoupons);

export default router;
