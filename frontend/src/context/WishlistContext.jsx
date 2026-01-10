import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { loading, isAuthenticated, isCustomer } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  /* ────────────────────────────────────────────────
     SAFE AUTO-LOAD (MATCHES CartContext FIX)
     Prevent Firefox infinite loops
     ──────────────────────────────────────────────── */
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !isCustomer) {
      setWishlist([]);
      localStorage.removeItem("wishlist");
      return;
    }

    loadWishlist();
  }, [loading, isAuthenticated, isCustomer]);

  /* ================= LOAD WISHLIST FROM BACKEND ================= */
  const loadWishlist = async () => {
    try {
      const res = await api.get("/wishlist");
      const dbWishlist = res.data?.wishlist || [];
      setWishlist(dbWishlist);
      localStorage.setItem("wishlist", JSON.stringify(dbWishlist));
    } catch (err) {
      console.error("Load wishlist failed", err);
    }
  };

  /* ================= TOGGLE WISHLIST ================= */
  const toggleWishlist = async (product) => {
    if (!product?.id) return;
    if (!isAuthenticated || !isCustomer) return; // prevent errors for admins/guests

    const exists = wishlist.some((p) => p.id === product.id);
    let updated;

    if (exists) {
      updated = wishlist.filter((p) => p.id !== product.id);
      api.delete(`/wishlist/${product.id}`).catch(() => {});
    } else {
      updated = [...wishlist, product];
      api.post("/wishlist", { productId: product.id }).catch(() => {});
    }

    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  /* ================= REMOVE FROM WISHLIST ================= */
  const removeFromWishlist = async (id) => {
    if (!isAuthenticated || !isCustomer) return;

    const updated = wishlist.filter((p) => p.id !== id);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));

    api.delete(`/wishlist/${id}`).catch(() => {});
  };

  /* ================= CHECK IF ITEM IS WISHLISTED ================= */
  const isWishlisted = (id) => wishlist.some((p) => p.id === id);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
