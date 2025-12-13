// src/admin/components/Dashboard.jsx
import React from "react";
import { PRODUCTS } from "../../data/products";

function countByCategory(products){
  const map = {};
  products.forEach(p => {
    const k = p.category || "Uncategorized";
    map[k] = (map[k]||0)+1;
  });
  return map;
}

export default function Dashboard(){
  const totalProducts = PRODUCTS.length;
  const totalCategories = Object.keys(countByCategory(PRODUCTS)).length;
  const avgPrice = Math.round(PRODUCTS.reduce((s,p)=>s+p.price,0)/Math.max(1,PRODUCTS.length));

  const top5 = [...PRODUCTS].sort((a,b)=>b.price-a.price).slice(0,5);

  const byCat = countByCategory(PRODUCTS);

  return (
    <div>
      <div style={{display:"flex",gap:16,marginBottom:16}}>
        <div className="card" style={{flex:1}}>
          <h3>Products</h3>
          <div className="stat">{totalProducts}</div>
          <div className="small">Total listed products</div>
        </div>
        <div className="card" style={{flex:1}}>
          <h3>Categories</h3>
          <div className="stat">{totalCategories}</div>
          <div className="small">Active categories</div>
        </div>
        <div className="card" style={{flex:1}}>
          <h3>Avg. price</h3>
          <div className="stat">₹{avgPrice}</div>
          <div className="small">Average product price</div>
        </div>
      </div>

      <div className="grid cols-3" style={{marginBottom:16}}>
        <div className="card">
          <h3>Best sellers (sample)</h3>
          <ul style={{margin:0,padding:0,listStyle:"none"}}>
            {top5.map(p => <li key={p.id} style={{padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}><strong>{p.title}</strong> <div className="small">₹{p.price}</div></li>)}
          </ul>
        </div>

        <div className="card">
          <h3>Products by category</h3>
          <ul style={{margin:0,padding:0,listStyle:"none"}}>
            {Object.entries(byCat).map(([k,v])=>(
              <li key={k} style={{padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}><div>{k}</div><div className="small">{v}</div></div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>Quick links</h3>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <a className="btn" href="/admin/products">Manage products</a>
            <a className="btn secondary" href="/admin/categories">Manage categories</a>
          </div>
        </div>
      </div>
    </div>
  );
}