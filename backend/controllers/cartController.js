import {
  addToCart,
  getCartItems,
  removeCartItem
} from "../models/cartModel.js";

/* ADD TO CART */
export const addCartItem = async (req, res) => {
  try {
     console.log("AUTH USER:", req.user);
    console.log("BODY:", req.body);  
    
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ ok: false, message: "Product ID required" });
    }

    await addToCart(userId, productId, quantity || 1);

    res.json({ ok: true, message: "Product added to cart" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/* GET CART */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await getCartItems(userId);

    res.json({ ok: true, cart });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/* REMOVE FROM CART */
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await removeCartItem(userId, productId);

    res.json({ ok: true, message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};
