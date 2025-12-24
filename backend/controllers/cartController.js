import pool from "../config/db.js";

/* ================= CART ================= */

// GET CART
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
      FROM carts c
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



// SYNC CART (ADD / UPDATE / REMOVE)
export const syncCart = async (req, res) => {
  const userId = req.user.id;
  const cart = req.body.cart || [];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Remove existing cart
    await conn.query(`DELETE FROM carts WHERE user_id = ?`, [userId]);

    // Insert updated cart
    for (const item of cart) {
      if (!item.id || !item.qty) continue;

      await conn.query(
        `
        INSERT INTO carts (user_id, product_id, quantity)
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

// REMOVE SINGLE ITEM (optional but useful)
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await pool.query(
      `DELETE FROM carts WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("removeFromCart error:", err);
    res.status(500).json({ ok: false });
  }
};

/* ================= WISHLIST ================= */

// GET WISHLIST
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
      FROM wishlists w
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



// SYNC WISHLIST
export const syncWishlist = async (req, res) => {
  const userId = req.user.id;
  const wishlist = req.body.wishlist || [];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(`DELETE FROM wishlists WHERE user_id = ?`, [userId]);

    for (const item of wishlist) {
      if (!item.id) continue;

      await conn.query(
        `
        INSERT INTO wishlists (user_id, product_id)
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
