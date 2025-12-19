import { pool } from "../config/db.js";

/* ===============================
   LIST ALL CMS PAGES
================================ */
export async function listCMSPages(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, slug, status FROM cms_pages ORDER BY id ASC"
    );

    res.json({ pages: rows });
  } catch (err) {
    console.error("List CMS pages error:", err);
    res.status(500).json({ message: "Failed to load CMS pages" });
  }
}

/* ===============================
   GET SINGLE CMS PAGE
================================ */
export async function getCMSPage(req, res) {
  try {
    const { id } = req.params;

    const [[page]] = await pool.query(
      "SELECT * FROM cms_pages WHERE id = ?",
      [id]
    );

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json({ page });
  } catch (err) {
    console.error("Get CMS page error:", err);
    res.status(500).json({ message: "Failed to load CMS page" });
  }
}

/* ===============================
   UPDATE CMS PAGE
================================ */
export async function updateCMSPage(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      content,
      status,
      seo_title,
      seo_description,
    } = req.body;

    await pool.query(
      `UPDATE cms_pages
       SET title = ?, slug = ?, content = ?, status = ?, 
           seo_title = ?, seo_description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, slug, content, status, seo_title, seo_description, id]
    );

    res.json({ message: "Page updated successfully" });
  } catch (err) {
    console.error("Update CMS page error:", err);
    res.status(500).json({ message: "Failed to update page" });
  }
}


/* ================= PUBLIC PAGE ================= */
export async function getPageBySlug(req, res) {
  try {
    const { slug } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM cms_pages WHERE slug = ? LIMIT 1",
      [slug]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Page not found" });
    }

    // Optional: only show published pages on frontend
    if (rows[0].status !== "Published") {
      return res.status(404).json({ message: "Page not published" });
    }

    res.json({ page: rows[0] });
  } catch (err) {
    console.error("CMS slug error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


/* ================= PUBLIC PAGE BY SLUG ================= */
export async function getPublicCMSPageBySlug(req, res) {
  try {
    const { slug } = req.params;

    const [[page]] = await pool.query(
      `SELECT 
        title, 
        slug, 
        content, 
        seo_title, 
        seo_description 
       FROM cms_pages 
       WHERE slug = ? AND status = 'Published'
       LIMIT 1`,
      [slug]
    );

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json(page);
  } catch (err) {
    console.error("CMS public page error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
