// src/admin/components/ProductDetail.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { PRODUCTS } from "../../data/products";

export default function ProductDetail() {
  const { id } = useParams();
  const pid = Number(id);
  const p = PRODUCTS.find(x=>x.id === pid);
  if (!p) return <div className="panel">Product not found. <Link to="/admin/products">Back</Link></div>;
  return (
    <div>
      <h2>Product detail</h2>
      <div className="panel">
        <div style={{display:"flex", gap:18}}>
          <img src={p.image} alt={p.title} style={{width:160}} onError={(e)=>e.target.style.display='none'} />
          <div>
            <h3>{p.title}</h3>
            <div>Category: {p.category}</div>
            <div>Price: ₹{p.price}</div>
            <div style={{marginTop:12}}>
              <Link to="/admin/products">Back to list</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
