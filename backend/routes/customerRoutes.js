import express from "express";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer
} from "../controllers/customerController.js";

import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyToken, isAdmin);

router.get("/", listCustomers);
router.get("/:id", getCustomer);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);

export default router;
