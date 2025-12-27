import express from "express";
import { authRequired, adminOnly  } from "../middleware/authMiddleware.js";
import { listCustomersAdmin } from "../controllers/customerController.js";

const router = express.Router();

router.get("/admin", authRequired, adminOnly, listCustomersAdmin);

export default router;
