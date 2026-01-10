import express from "express";
import { razorpayWebhook } from "../controllers/paymentWebhookController.js";

const router = express.Router();

// Razorpay sends POST requests WITHOUT authentication
router.post("/razorpay", express.json({ type: "*/*" }), razorpayWebhook);

export default router;
