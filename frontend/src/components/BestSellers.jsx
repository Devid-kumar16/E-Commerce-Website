// src/admin/components/BestSellers.jsx
import React from "react";
import { PRODUCTS } from "../../data/products";

export default function BestSellers(){
  const top = [...PRODUCTS].sort((a,b)=>b.price-a.price).slice(0,10);
  return (
    <div>
      <h2>Best Sellers</h2>
      <div className="card">
        <ul style={{listStyle:"none",margin:0,padding:0}}>
          {top.map(p=>(
            <li key={p.id} style={{padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><div>{p.title}</div><div>₹{p.price}</div></div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}