import { useEffect, useState } from "react";
import { getProducts } from "../api/product";

import CategoryNavbar from "../components/CategoryNavbar";
import BannerSlider from "../components/BannerSlider";
import ProductGrid from "../components/ProductGrid";

import "../styles/Home.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [banners] = useState(["/images/hero.jpg"]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const list = await getProducts();
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="home-layout">

      {/* CATEGORY NAVBAR */}
      <CategoryNavbar />

      {/* BANNER */}
      <div className="banner-wrapper">
        <BannerSlider images={banners} />
      </div>

      {/* PRODUCTS */}
      <section className="section">
        <h2>All Products</h2>

        {loading ? (
          <p className="loading-text">Loading products...</p>
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </div>
  );
}
