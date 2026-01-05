import express from "express";
import { adminDashboard } from "../controllers/dashboardController.js";
import { adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", adminOnly, adminDashboard);

export default router;

