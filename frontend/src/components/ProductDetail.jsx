// src/components/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/ProductDetails.css";
import { useCart } from "../context/CartContext"; // ✅ FIX

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart(); // ✅ FIX

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      // 1️⃣ Fetch current product
      const res = await api.get(`/products/${id}`);
      const currentProduct = res.data.product;
      setProduct(currentProduct);

      // 2️⃣ Fetch all products
      const all = await api.get("/products");
      const allProducts = all.data.products || [];

      // 3️⃣ Normalize category
      const currentCategory = String(currentProduct.category || "")
        .toLowerCase()
        .trim();

      // 4️⃣ Filter similar products
      const filtered = allProducts.filter((p) => {
        const pCategory = String(p.category || "")
          .toLowerCase()
          .trim();

        return (
          pCategory === currentCategory &&
          Number(p.id) !== Number(currentProduct.id)
        );
      });

      setSimilar(filtered);
    } catch (err) {
      console.error("Failed to load product/similar products", err);
      setSimilar([]);
    }
  };

  if (!product) return null;

  const image =
    (product.image_url && product.image_url.trim()) ||
    (product.image && product.image.trim()) ||
    "/images/placeholder.png";

  return (
    <div className="pd-page">
      <div className="pd-container">
        {/* IMAGE */}
        <div className="pd-image-box">
          <img
            src={image}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src = "/images/placeholder.png";
            }}
          />
        </div>

        {/* INFO */}
        <div className="pd-info">
          <h1>{product.name}</h1>
          <p className="pd-price">₹{product.price}</p>

          <p className="pd-category">
            Category: <span>{product.category}</span>
          </p>

          <div className="pd-actions">
            <button
              className="pd-add"
              onClick={() =>
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image,
                })
              }
            >
              Add to Cart
            </button>

            <button className="pd-buy">Buy Now</button>
          </div>
        </div>
      </div>

      {/* SIMILAR PRODUCTS */}
      {similar.length > 0 && (
        <div className="pd-similar">
          <h2>Similar Products</h2>

          <div className="pd-similar-grid">
            {similar.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="pd-similar-card"
              >
                <img
                  src={p.image || p.image_url || "/images/placeholder.png"}
                  alt={p.name}
                />
                <h4>{p.name}</h4>
                <p>₹{p.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
