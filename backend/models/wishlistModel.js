import {pool} from "../config/db.js";

/* Add to wishlist */
export const addToWishlist = async (userId, productId) => {
  await pool.query(
    "INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)",
    [userId, productId]
  );
};

/* Get wishlist */
export const getWishlistItems = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
        w.id,
        p.id AS product_id,
        p.name,
        p.price,
        p.image_url
     FROM wishlist_items w
     JOIN products p ON w.product_id = p.id
     WHERE w.user_id = ?`,
    [userId]
  );

  return rows;
};

/* Remove wishlist item */
export const removeWishlistItem = async (userId, productId) => {
  await pool.query(
    "DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?",
    [userId, productId]
  );
};
