// src/admin/components/ProductOverview.jsx
import React from "react";
import { PRODUCTS } from "../../data/products";

export default function ProductOverview(){
  const categories = PRODUCTS.reduce((acc,p) => { acc[p.category] = (acc[p.category]||0)+1; return acc }, {});
  return (
    <div>
      <h2>Product Overview</h2>
      <div className="grid cols-3" style={{marginTop:12}}>
        {Object.entries(categories).map(([k,v])=>(
          <div className="card" key={k}>
            <h3>{k}</h3>
            <div className="stat">{v}</div>
            <div className="small">Items</div>
          </div>
        ))}
      </div>
    </div>
  );
}