import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  /* ======================================================
     LOAD CART + WISHLIST WHEN USER LOGS IN OR OUT
  ====================================================== */
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

  /* ================= LOAD CART ================= */
  const loadCart = async () => {
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

  /* ======================================================
     ADD TO CART
  ====================================================== */
  const addToCart = async (product) => {
    if (!product?.id) return;

    if (product.stock === 0) {
      alert("This product is out of stock");
      return;
    }

    let updated = [...cart];
    const index = updated.findIndex((p) => p.id === product.id);

    if (index >= 0) {
      updated[index] = {
        ...updated[index],
        qty: Math.min(updated[index].qty + 1, product.stock),
      };
    } else {
      updated.push({
        ...product,
        qty: 1,
        stock: product.stock,
      });
    }

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    // Sync to backend
    api.post("/cart/sync", { cart: updated }).catch(() => {});
  };

  /* ======================================================
     UPDATE QUANTITY  (🔥 industry-standard)
  ====================================================== */
  const updateQty = async (productId, qty) => {
    const product = cart.find((item) => item.id === productId);
    if (!product) return;

    // Prevent negative or zero qty
    if (qty < 1) qty = 1;

    // Stock check
    if (qty > product.stock) {
      alert(`Only ${product.stock} available`);
      return;
    }

    const updated = cart.map((item) =>
      item.id === productId ? { ...item, qty } : item
    );

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    api.post("/cart/sync", { cart: updated }).catch(() => {});
  };

  /* ======================================================
     REMOVE FROM CART
  ====================================================== */
  const removeFromCart = async (productId) => {
    const updated = cart.filter((item) => item.id !== productId);

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    api.post("/cart/sync", { cart: updated }).catch(() => {});
  };

  /* ======================================================
     CLEAR CART
  ====================================================== */
  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem("cart");

    api.post("/cart/sync", { cart: [] }).catch(() => {});
  };

  /* ======================================================
     TOGGLE WISHLIST
  ====================================================== */
  const toggleWishlist = async (product) => {
    if (!product?.id) return;

    const exists = wishlist.some((i) => i.id === product.id);

    let updated;

    if (exists) {
      updated = wishlist.filter((i) => i.id !== product.id);
      api.delete(`/wishlist/${product.id}`).catch(() => {});
    } else {
      updated = [...wishlist, product];
      api.post("/wishlist", { productId: product.id }).catch(() => {});
    }

    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  /* ======================================================
     PROVIDER EXPORT
  ====================================================== */
  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,

        addToCart,
        updateQty,
        removeFromCart,
        clearCart,

        toggleWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* ================= CUSTOM HOOK ================= */
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
