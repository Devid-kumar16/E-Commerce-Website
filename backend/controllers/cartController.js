import pool from "../config/db.js";

/* ================= CART ================= */

/**
 * GET CART (user-specific)
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT 
        c.product_id AS id,
        c.quantity AS qty,
        p.name,
        p.price,
        p.image_url
      FROM cart_items c
      JOIN products p ON p.id = c.product_id
      WHERE c.user_id = ?
      `,
      [userId]
    );

    res.json({ ok: true, cart: rows });
  } catch (err) {
    console.error("getCart error:", err);
    res.status(500).json({ ok: false, message: "Failed to load cart" });
  }
};

/**
 * SYNC CART (replace entire cart)
 * Used after add/update/remove from frontend
 */
export const syncCart = async (req, res) => {
  const userId = req.user.id;
  const cart = Array.isArray(req.body.cart) ? req.body.cart : [];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 🔹 Clear only this user's cart
    await conn.query(
      `DELETE FROM cart_items WHERE user_id = ?`,
      [userId]
    );

    // 🔹 Insert updated cart
    for (const item of cart) {
      if (!item?.id || item.qty <= 0) continue;

      await conn.query(
        `
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES (?, ?, ?)
        `,
        [userId, item.id, item.qty]
      );
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error("syncCart error:", err);
    res.status(500).json({ ok: false, message: "Failed to sync cart" });
  } finally {
    conn.release();
  }
};

/**
 * REMOVE SINGLE CART ITEM
 */
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.productId);

    if (!productId) {
      return res.status(400).json({ ok: false, message: "Invalid product id" });
    }

    await pool.query(
      `
      DELETE FROM cart_items 
      WHERE user_id = ? AND product_id = ?
      `,
      [userId, productId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("removeFromCart error:", err);
    res.status(500).json({ ok: false, message: "Failed to remove item" });
  }
};

/* ================= WISHLIST ================= */

/**
 * GET WISHLIST (user-specific)
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
 * SYNC WISHLIST (replace entire wishlist)
 */
export const syncWishlist = async (req, res) => {
  const userId = req.user.id;
  const wishlist = Array.isArray(req.body.wishlist) ? req.body.wishlist : [];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `DELETE FROM wishlist_items WHERE user_id = ?`,
      [userId]
    );

    for (const item of wishlist) {
      if (!item?.id) continue;

      await conn.query(
        `
        INSERT INTO wishlist_items (user_id, product_id)
        VALUES (?, ?)
        `,
        [userId, item.id]
      );
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error("syncWishlist error:", err);
    res.status(500).json({ ok: false, message: "Failed to sync wishlist" });
  } finally {
    conn.release();
  }
};
