// src/admin/components/Categories.jsx
import React from "react";
import { PRODUCTS } from "../../data/products";

export default function Categories(){
  const map = {};
  PRODUCTS.forEach(p => {
    const k = p.category || "Uncategorized";
    map[k] = map[k] || {count:0, sample: p};
    map[k].count++;
  });
  return (
    <div>
      <h2>Categories</h2>
      <div className="card">
        <table className="table">
          <thead><tr><th>Category</th><th>Products</th></tr></thead>
          <tbody>
            {Object.entries(map).map(([k,v])=>(
              <tr key={k}><td>{k}</td><td className="small">{v.count}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}