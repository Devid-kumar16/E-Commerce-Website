import express from "express";
import { authRequired, isAdmin } from "../middleware/authMiddleware.js";
import { listCustomersAdmin } from "../controllers/customerController.js";

const router = express.Router();

router.get("/admin", authRequired, isAdmin, listCustomersAdmin);

export default router;
