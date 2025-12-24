import ProductCard from "./ProductCard";
import { useCart } from "../context/CartContext";

function ProductsList({ products }) {
  const { wishlist, toggleWishlist, addToCart } = useCart();

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlist.some((p) => p.id === product.id)}
          onToggleWishlist={toggleWishlist}
          onAddToCart={addToCart}
        />
      ))}
    </div>
  );
}

export default ProductsList;
