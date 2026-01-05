// src/context/CartContext.js
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  /* ======================================================
     LOAD CART & WISHLIST ON LOGIN / LOGOUT
  ====================================================== */
  useEffect(() => {
    if (!isAuthenticated) {
      setCart([]);
      setWishlist([]);
      localStorage.removeItem("cart");
      localStorage.removeItem("wishlist");
      return;
    }

    fetchCart();
    fetchWishlist();
  }, [isAuthenticated]);

  /* ================= LOAD CART ================= */
  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      const dbCart = res.data?.cart || [];
      setCart(dbCart);
      localStorage.setItem("cart", JSON.stringify(dbCart));
    } catch (err) {
      console.error("Load cart failed", err);
    }
  };

  /* ================= LOAD WISHLIST ================= */
  const fetchWishlist = async () => {
    try {
      const res = await api.get("/wishlist");
      const dbWishlist = res.data?.wishlist || [];
      setWishlist(dbWishlist);
      localStorage.setItem("wishlist", JSON.stringify(dbWishlist));
    } catch (err) {
      console.error("Load wishlist failed", err);
    }
  };

  /* ======================================================
     ADD TO CART
  ====================================================== */
const addToCart = async (product) => {
  if (product.stock === 0) {
    alert("This product is out of stock");
    return;
  }

  let updated = [...cart];
  const idx = updated.findIndex(p => p.id === product.id);

  if (idx >= 0) {
    updated[idx] = {
      ...updated[idx],
      qty: updated[idx].qty + 1,
    };
  } else {
    updated.push({
      ...product,
      qty: 1,
      stock: product.stock, // ✅ CRITICAL
    });
  }

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));
  await api.post("/cart/sync", { cart: updated });
};




  /* ======================================================
     UPDATE QUANTITY (🔥 FIXED & SAFE)
  ====================================================== */
const updateQty = async (productId, qty) => {
  const product = cart.find((i) => i.id === productId);
  if (!product) return;

  if (product.stock === 0) {
    alert(`${product.name} is out of stock`);
    removeFromCart(productId);
    return;
  }

  if (qty > product.stock) {
    alert(`Only ${product.stock} left`);
    return;
  }

  const updated = cart.map((item) =>
    item.id === productId ? { ...item, qty } : item
  );

  setCart(updated);
  localStorage.setItem("cart", JSON.stringify(updated));

  await api.post("/cart/sync", { cart: updated }).catch(() => {});
};


  /* ======================================================
     REMOVE FROM CART
  ====================================================== */
  const removeFromCart = async (productId) => {
    const updated = cart.filter((item) => item.id !== productId);

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    try {
      await api.post("/cart/sync", { cart: updated });
    } catch (err) {
      console.error("Cart sync failed", err);
    }
  };

  /* ======================================================
     CLEAR CART
  ====================================================== */
  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem("cart");

    try {
      await api.post("/cart/sync", { cart: [] });
    } catch {
      /* silent */
    }
  };

  /* ======================================================
     WISHLIST TOGGLE
  ====================================================== */
  const toggleWishlist = async (product) => {
    if (!product?.id) return;

    const exists = wishlist.some((p) => p.id === product.id);
    let updated;

    if (exists) {
      updated = wishlist.filter((p) => p.id !== product.id);
      await api.delete(`/wishlist/${product.id}`).catch(() => {});
    } else {
      updated = [...wishlist, product];
      await api.post("/wishlist", { productId: product.id }).catch(() => {});
    }

    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  /* ======================================================
     CONTEXT PROVIDER
  ====================================================== */
  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        updateQty,      // ✅ exists
        removeFromCart,
        clearCart,
        toggleWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* ================= USE CART HOOK ================= */
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
};
