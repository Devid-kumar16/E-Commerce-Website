import React from "react";
import { Link } from "react-router-dom";
import "../styles/Wishlist.css";

export default function WishlistPage({ wishlist, setWishlist, onAddToCart }) {
  const removeFromWishlist = (id) => {
    setWishlist((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem("estore_wishlist_v1", JSON.stringify(next));
      return next;
    });
  };

  const moveToCart = (item) => {
    onAddToCart(item);
    removeFromWishlist(item.id);
  };

  return (
    <div className="wishlist-page">
      <h2 className="wishlist-title">My Wishlist</h2>

      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <h3>Your wishlist is empty</h3>
          <Link to="/" className="wishlist-btn">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => (
            <div className="wishlist-card" key={item.id}>
              <Link to={`/product/${item.id}`}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="wishlist-image"
                />
              </Link>

              <div className="wishlist-info">
                <h4>{item.name}</h4>
                <p className="wishlist-price">₹{item.price}</p>
              </div>

              <div className="wishlist-actions">
                <button
                  className="wishlist-cart-btn"
                  onClick={() => moveToCart(item)}
                >
                  Add to Cart
                </button>

                <button
                  className="wishlist-remove-btn"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  Remove
                </button>

                <Link
                  to={`/product/${item.id}`}
                  className="wishlist-view-btn"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
