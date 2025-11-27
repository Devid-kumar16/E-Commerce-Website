// src/admin/components/ProductDetail.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { PRODUCTS } from "../../data/products";

export default function ProductDetail(){
  const { id } = useParams();
  const pid = Number(id);
  const product = PRODUCTS.find(p=>p.id === pid);
  if(!product) return <div className="card">Product not found</div>;

  return (
    <div>
      <div style={{display:"flex",gap:16,marginBottom:16}}>
        <div style={{width:320}} className="card">
          <img src={product.image} alt={product.title} style={{width:"100%",objectFit:"contain"}} />
        </div>
        <div style={{flex:1}}>
          <div className="card">
            <h2 style={{marginTop:0}}>{product.title}</h2>
            <div className="small">Category: {product.category}</div>
            <div style={{fontSize:20,fontWeight:700,marginTop:8}}>₹{product.price}</div>
            <div style={{marginTop:12}}>
              <button className="btn">Edit product</button>
              <Link to="/admin/products" className="btn secondary" style={{marginLeft:8}}>Back to list</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Details</h3>
        <p className="small">This demo product uses sample data only.</p>
      </div>
    </div>
  );
}
