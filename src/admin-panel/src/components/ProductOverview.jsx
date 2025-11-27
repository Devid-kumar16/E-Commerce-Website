// src/admin/components/ProductOverview.jsx
import React from "react";

export default function ProductOverview({ products }) {
  return (
    <div className="card">
      <div className="row-between">
        <h3 style={{margin:0}}>Product overview</h3>
        <a className="view-all" href="#view">View all ▾</a>
      </div>

      <table className="product-table" aria-hidden="false">
        <thead>
          <tr>
            <th>Name</th>
            <th>Product ID</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Sale</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>
                <div style={{display:"flex", alignItems:"center", gap:12}}>
                  <div className="product-thumb">{p.thumb ? <img src={p.thumb} alt={p.name} style={{width:"100%", height:"100%", objectFit:"cover"}}/> : "📦"}</div>
                  <div>
                    <div style={{fontWeight:600}}>{p.name}</div>
                    <div className="small-muted">Sample product description</div>
                  </div>
                </div>
              </td>
              <td>#{p.id}</td>
              <td>{p.price}</td>
              <td>{p.qty}</td>
              <td className="small-muted">--/--</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
