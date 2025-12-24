import {pool} from "../config/db.js";

/* Add or update cart item */
export const addToCart = async (userId, productId, quantity = 1) => {
  const [rows] = await pool.query(
    "SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?",
    [userId, productId]
  );

  if (rows.length > 0) {
    // update quantity
    await pool.query(
      "UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
      [quantity, userId, productId]
    );
  } else {
    // insert new
    await pool.query(
      "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
      [userId, productId, quantity]
    );
  }
};

/* Get cart items */
export const getCartItems = async (userId) => {
  const [rows] = await pool.query(
    `SELECT 
        c.id,
        c.quantity,
        p.id AS product_id,
        p.name,
        p.price,
        p.image_url
     FROM cart_items c
     JOIN products p ON c.product_id = p.id
     WHERE c.user_id = ?`,
    [userId]
  );

  return rows;
};

/* Remove cart item */
export const removeCartItem = async (userId, productId) => {
  await pool.query(
    "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
    [userId, productId]
  );
};
