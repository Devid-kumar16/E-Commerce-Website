import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

/**
 * GET /api/pages/:slug
 * Public CMS page by slug
 */
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const [rows] = await pool.query(
      "SELECT title, slug, content, seo_title, seo_description FROM cms_pages WHERE slug = ? AND status = 'Published' LIMIT 1",
      [slug]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Public CMS error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
