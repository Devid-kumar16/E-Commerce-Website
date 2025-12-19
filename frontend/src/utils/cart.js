const CART_KEY = "estore_cart_v1";

export const addToCart = (product) => {
  const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

  const existing = cart.find((p) => p.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const getCart = () => {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
};

export const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
};

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
};
