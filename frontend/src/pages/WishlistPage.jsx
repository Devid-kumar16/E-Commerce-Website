import { useCart } from "../context/CartContext";
import "../styles/Wishlist.css";

function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  if (wishlist.length === 0) {
    return <h2 className="wishlist-empty">Your wishlist is empty</h2>;
  }

  return (
    <div className="wishlist-page">
      <h2 className="wishlist-title">My Wishlist</h2>

      <div className="wishlist-grid">
        {wishlist.map((item) => (
          <div key={item.id} className="wishlist-card">
            <div className="wishlist-image">
              <img
                src={item.image_url || item.image}
                alt={item.name}
                onError={(e) => (e.target.src = "/placeholder.png")}
              />
            </div>

            <div className="wishlist-info">
              <h4>{item.name}</h4>
              <p className="wishlist-price">₹{item.price}</p>

              <div className="wishlist-actions">
                <button
                  className="btn-cart"
                  onClick={() => addToCart(item)}
                >
                  Add to Cart
                </button>

                <button
                  className="btn-remove"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WishlistPage;
