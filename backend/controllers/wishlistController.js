import pool from "../config/db.js";

/**
 * ADD TO WISHLIST (USER-SPECIFIC)
 */
export const addWishlistItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ ok: false, message: "Product ID required" });
    }

    await pool.query(
      `
      INSERT IGNORE INTO wishlist_items (user_id, product_id)
      VALUES (?, ?)
      `,
      [userId, productId]
    );

    res.json({ ok: true, message: "Added to wishlist" });
  } catch (err) {
    console.error("addWishlistItem error:", err);
    res.status(500).json({ ok: false, message: "Failed to add to wishlist" });
  }
};

/**
 * GET WISHLIST (USER-SPECIFIC)
 */
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT 
        w.product_id AS id,
        p.name,
        p.price,
        p.image_url
      FROM wishlist_items w
      JOIN products p ON p.id = w.product_id
      WHERE w.user_id = ?
      `,
      [userId]
    );

    res.json({ ok: true, wishlist: rows });
  } catch (err) {
    console.error("getWishlist error:", err);
    res.status(500).json({ ok: false, message: "Failed to load wishlist" });
  }
};

/**
 * REMOVE FROM WISHLIST (USER-SPECIFIC)
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.productId);

    if (!productId) {
      return res
        .status(400)
        .json({ ok: false, message: "Invalid product ID" });
    }

    await pool.query(
      `
      DELETE FROM wishlist_items 
      WHERE user_id = ? AND product_id = ?
      `,
      [userId, productId]
    );

    res.json({ ok: true, message: "Removed from wishlist" });
  } catch (err) {
    console.error("removeFromWishlist error:", err);
    res
      .status(500)
      .json({ ok: false, message: "Failed to remove wishlist item" });
  }
};
