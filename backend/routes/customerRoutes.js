import express from "express";
import { authRequired } from "../middleware/authMiddleware.js";
import { getProfile } from "../controllers/customerController.js";

const router = express.Router();

// CUSTOMER PROFILE ONLY
router.get("/profile", authRequired, getProfile);

export default router;
