import {
  addToWishlist,
  getWishlistItems,
  removeWishlistItem
} from "../models/wishlistModel.js";

/* ADD TO WISHLIST */
export const addWishlistItem = async (req, res) => {
  try {
    console.log("AUTH USER:", req.user);
    console.log("BODY:", req.body); 
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ ok: false, message: "Product ID required" });
    }

    await addToWishlist(userId, productId);

    res.json({ ok: true, message: "Added to wishlist" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/* GET WISHLIST */
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await getWishlistItems(userId);

    res.json({ ok: true, wishlist });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/* REMOVE FROM WISHLIST */
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await removeWishlistItem(userId, productId);

    res.json({ ok: true, message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};
