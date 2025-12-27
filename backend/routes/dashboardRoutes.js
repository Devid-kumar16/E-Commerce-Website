import express from "express";
import { adminDashboard } from "../controllers/dashboardController.js";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin/dashboard", authRequired, adminOnly, adminDashboard);
export default router;
