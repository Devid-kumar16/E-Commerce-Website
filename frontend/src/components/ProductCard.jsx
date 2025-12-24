import { FaHeart } from "react-icons/fa";

function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart, // ✅ ADD THIS
}) {
  // ✅ Safe image resolver
  const imageSrc =
    product.image_url ||
    product.image ||
    (Array.isArray(product.images) ? product.images[0] : null) ||
    "/placeholder.png";

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img
          src={imageSrc}
          alt={product.name}
          onError={(e) => {
            e.target.src = "/placeholder.png";
          }}
        />

        {/* ✅ Wishlist Button */}
<button
  type="button"
  className="wishlist-btn"
  onClick={() => onToggleWishlist(product)}
>
  <FaHeart className="wishlist-icon" />
</button>

      </div>

      <div className="product-info">
        <h4>{product.name}</h4>
        <p className="product-price">₹{product.price}</p>

        {/* ✅ Add to Cart Button FIXED */}
        <button
          type="button"
          className="btn-add-cart"
          onClick={() => onAddToCart(product)}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
