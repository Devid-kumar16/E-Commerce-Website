// src/admin/components/Products.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PRODUCTS } from "../../data/products";

export default function Products(){
  const [q, setQ] = useState("");
  const filtered = PRODUCTS.filter(p => p.title.toLowerCase().includes(q.toLowerCase()) || (p.category||"").toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h2>Products</h2>
        <input placeholder="Search products..." value={q} onChange={e=>setQ(e.target.value)} style={{padding:8,borderRadius:8,border:"1px solid #e6eef7"}} />
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Title</th><th>Category</th><th>Price</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td className="small">{p.category}</td>
                <td>₹{p.price}</td>
                <td style={{textAlign:"right"}}><Link to={`/admin/product/${p.id}`} className="btn secondary">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
