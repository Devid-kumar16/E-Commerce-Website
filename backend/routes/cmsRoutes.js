import express from "express";
import {
  listCMSPages,
  getCMSPage,
  updateCMSPage,
  getPublicCMSPageBySlug, // ✅ ADD THIS
} from "../controllers/cmsController.js";
import { getPageBySlug } from "../controllers/cmsController.js";

import { authRequired, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= ADMIN ================= */
router.use(authRequired, isAdmin);

router.get("/pages", listCMSPages);
router.get("/pages/:id", getCMSPage);
router.put("/pages/:id", updateCMSPage);

/* ================= PUBLIC ================= */
// ✅ PUBLIC CMS PAGE (NO AUTH)
router.get("/public/:slug", getPublicCMSPageBySlug);
router.get("/pages/slug/:slug", getPageBySlug);
export default router;
