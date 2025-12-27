import pool from "../config/db.js";

/**
 * ADD TO WISHLIST
 * (User-specific, duplicate-safe)
 */
export const addToWishlist = async (userId, productId) => {
  await pool.query(
    `
    INSERT IGNORE INTO wishlists (user_id, product_id)
    VALUES (?, ?)
    `,
    [userId, productId]
  );
};

/**
 * GET WISHLIST ITEMS (USER-SPECIFIC)
 */
export const getWishlistItems = async (userId) => {
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

  return rows;
};

/**
 * REMOVE FROM WISHLIST
 */
export const removeWishlistItem = async (userId, productId) => {
  await pool.query(
    `
    DELETE FROM wishlists
    WHERE user_id = ? AND product_id = ?
    `,
    [userId, productId]
  );
};
