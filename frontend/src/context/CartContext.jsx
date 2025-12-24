import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";
import { isLoggedIn } from "../utils/auth";

const CartContext = createContext();

const CART_KEY = "estore_cart_v1";
const WISHLIST_KEY = "estore_wishlist_v1";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  /* ================= INIT ON APP LOAD ================= */
  useEffect(() => {
    initCart();
    initWishlist();
  }, []);

  /* ================= INIT CART ================= */
  const initCart = async () => {
    if (isLoggedIn()) {
      try {
        const res = await api.get("/cart");

        if (res.data?.cart && res.data.cart.length > 0) {
          setCart(res.data.cart);
          return;
        }

        // 🔥 FALLBACK TO LOCAL
        const localCart =
          JSON.parse(localStorage.getItem(CART_KEY)) || [];
        setCart(localCart);
      } catch (err) {
        console.warn("DB cart failed, using local cart");
        const localCart =
          JSON.parse(localStorage.getItem(CART_KEY)) || [];
        setCart(localCart);
      }
    } else {
      const localCart =
        JSON.parse(localStorage.getItem(CART_KEY)) || [];
      setCart(localCart);
    }
  };

  /* ================= INIT WISHLIST ================= */
  const initWishlist = async () => {
    if (isLoggedIn()) {
      try {
        const res = await api.get("/cart/wishlist");

        if (res.data?.wishlist && res.data.wishlist.length > 0) {
          setWishlist(res.data.wishlist);
          return;
        }

        setWishlist(
          JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []
        );
      } catch (err) {
        console.warn("DB wishlist failed, using local wishlist");
        setWishlist(
          JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []
        );
      }
    } else {
      setWishlist(
        JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []
      );
    }
  };

  /* ================= SAVE LOCAL ================= */
  const saveLocal = (cartData, wishlistData) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartData));
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistData));
  };

  /* ================= SYNC DB ================= */
  const syncCartDB = async (data) => {
    await api.post("/cart/sync", { cart: data });
  };

  const syncWishlistDB = async (data) => {
    await api.post("/cart/wishlist/sync", { wishlist: data });
  };

  /* ================= CART ================= */
  const addToCart = async (product) => {
    if (!product?.id) return;

    const updated = [...cart];
    const index = updated.findIndex((p) => p.id === product.id);

    if (index >= 0) {
      updated[index].qty += 1;
    } else {
      updated.push({ ...product, qty: 1 });
    }

    setCart(updated);

    if (isLoggedIn()) {
      await syncCartDB(updated);
    } else {
      saveLocal(updated, wishlist);
    }
  };

  const removeFromCart = async (id) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);

    if (isLoggedIn()) {
      await syncCartDB(updated);
    } else {
      saveLocal(updated, wishlist);
    }
  };

  const clearCart = async () => {
    setCart([]);

    if (isLoggedIn()) {
      await syncCartDB([]);
    } else {
      localStorage.removeItem(CART_KEY);
    }
  };

  /* ================= WISHLIST ================= */
  const toggleWishlist = async (product) => {
    if (!product?.id) return;

    let updated;

    if (wishlist.some((p) => p.id === product.id)) {
      updated = wishlist.filter((p) => p.id !== product.id);
    } else {
      updated = [...wishlist, product];
    }

    setWishlist(updated);

    if (isLoggedIn()) {
      await syncWishlistDB(updated);
    } else {
      saveLocal(cart, updated);
    }
  };

  const removeFromWishlist = async (id) => {
    const updated = wishlist.filter((item) => item.id !== id);
    setWishlist(updated);

    if (isLoggedIn()) {
      await syncWishlistDB(updated);
    } else {
      saveLocal(cart, updated);
    }
  };

  /* ================= MERGE AFTER LOGIN ================= */
  const mergeLocalToDB = async () => {
    const localCart =
      JSON.parse(localStorage.getItem(CART_KEY)) || [];
    const localWishlist =
      JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];

    if (localCart.length) await syncCartDB(localCart);
    if (localWishlist.length) await syncWishlistDB(localWishlist);

    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(WISHLIST_KEY);

    await initCart();
    await initWishlist();
  };

  /* ================= UPDATE QTY ================= */
const updateQty = async (id, qty) => {
  if (qty < 1) return;

  const updated = cart.map((item) =>
    item.id === id ? { ...item, qty } : item
  );

  setCart(updated);

  if (isLoggedIn()) {
    await syncCartDB(updated);
  } else {
    saveLocal(updated, wishlist);
  }
};


  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        clearCart,
        toggleWishlist,
        removeFromWishlist,
        updateQty, 
        mergeLocalToDB, // 🔥 call after login
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
