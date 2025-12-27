import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(() => {
    const stored = localStorage.getItem("wishlist");
    return stored ? JSON.parse(stored) : [];
  });

  /* ================= LOAD DATA ON LOGIN ================= */
  useEffect(() => {
    if (!isAuthenticated) {
      setCart([]);
      setWishlist([]);
      localStorage.removeItem("cart");
      localStorage.removeItem("wishlist");
      return;
    }

    loadCart();
    loadWishlist();
  }, [isAuthenticated]);

  /* ================= LOAD CART FROM DB ================= */
  const loadCart = async () => {
    try {
      const res = await api.get("/cart");
      const dbCart = res.data.cart || [];

      setCart(dbCart);
      localStorage.setItem("cart", JSON.stringify(dbCart));
    } catch (err) {
      console.error("Load cart failed", err);
    }
  };

  /* ================= LOAD WISHLIST FROM DB ================= */
  const loadWishlist = async () => {
    try {
      const res = await api.get("/wishlist");
      const dbWishlist = res.data.wishlist || [];

      setWishlist(dbWishlist);
      localStorage.setItem("wishlist", JSON.stringify(dbWishlist));
    } catch (err) {
      console.error("Load wishlist failed", err);
    }
  };

  /* ================= CART OPS ================= */
  const addToCart = async (product) => {
    const updated = [...cart];
    const idx = updated.findIndex((p) => p.id === product.id);

    if (idx >= 0) updated[idx].qty += 1;
    else updated.push({ ...product, qty: 1 });

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    try {
      await api.post("/cart/sync", { cart: updated });
    } catch (err) {
      console.error("Cart sync failed", err);
    }
  };

  const removeFromCart = async (id) => {
    const updated = cart.filter((i) => i.id !== id);

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    try {
      await api.post("/cart/sync", { cart: updated });
    } catch (err) {
      console.error("Cart sync failed", err);
    }
  };

  /* ================= CLEAR CART (🔥 FIX) ================= */
const clearCart = () => {
  setCart([]);
  localStorage.removeItem("cart");

  api.post("/cart/sync", { cart: [] }).catch(() => {});
};


  /* ================= WISHLIST OPS ================= */
  const toggleWishlist = async (product) => {
    const exists = wishlist.some((p) => p.id === product.id);
    let updated;

    if (exists) {
      updated = wishlist.filter((p) => p.id !== product.id);
      try {
        await api.delete(`/wishlist/${product.id}`);
      } catch (err) {
        console.error("Wishlist remove failed", err);
      }
    } else {
      updated = [...wishlist, product];
      try {
        await api.post("/wishlist", { productId: product.id });
      } catch (err) {
        console.error("Wishlist add failed", err);
      }
    }

    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        toggleWishlist,
        clearCart, // ✅ NOW AVAILABLE
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
};
