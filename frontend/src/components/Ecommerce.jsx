// src/admin/components/Ecommerce.jsx
import React from "react";
import { Link } from "react-router-dom";
import { PRODUCTS } from "../../data/products";

export default function Ecommerce(){
  return (
    <div>
      <h2 style={{marginBottom:12}}>E-commerce — Products</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
        {PRODUCTS.map(p => (
          <div key={p.id} className="card">
            <div style={{height:140,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <img src={p.image} alt={p.title} style={{maxHeight:"100%",maxWidth:"100%",objectFit:"contain"}} />
            </div>
            <h4 style={{margin:"8px 0"}}>{p.title}</h4>
            <div className="small">₹{p.price}</div>
            <div style={{marginTop:8,display:"flex",gap:8}}>
              <Link to={`/admin/product/${p.id}`} className="btn secondary">View</Link>
              <button className="btn">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}