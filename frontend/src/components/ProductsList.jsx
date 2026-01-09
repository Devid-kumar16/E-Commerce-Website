// src/components/ProductsList.jsx
import ProductCard from "./ProductCard";
import { useCart } from "../context/CartContext";

function ProductsList({ products = [] }) {
  const { wishlist, toggleWishlist, addToCart } = useCart();

  if (!products.length) {
    return (
      <div className="no-products">
        <h2>No products found</h2>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlist.some((p) => p.id === product.id)}
          onToggleWishlist={() => toggleWishlist(product)}
          onAddToCart={() => addToCart(product)}
        />
      ))}
    </div>
  );
}

export default ProductsList;
