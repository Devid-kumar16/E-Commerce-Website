// src/admin/components/Dashboard.jsx
import React from "react";
import SellersList from "./SellersList";
import ProductOverview from "./ProductOverview";
import { sellers, products } from "../admin-data";

export default function Dashboard() {
  return (
    <>
      <div className="cards-grid">
        <div className="card stat">
          <div className="label">Total Sales</div>
          <div className="value">34,945</div>
        </div>
        <div className="card stat">
          <div className="label">Total Income</div>
          <div className="value">₹37,802</div>
        </div>
        <div className="card stat">
          <div className="label">Orders Paid</div>
          <div className="value">34,945</div>
        </div>
        <div className="card stat">
          <div className="label">Total Visitors</div>
          <div className="value">34,945</div>
        </div>
      </div>

      <div className="admin-content">
        <div>
          <SellersList sellers={sellers} />
          <div style={{height:18}} />
          <div className="card">
            <h3 style={{margin:0}}>Recent Orders</h3>
            <div style={{height:12}} />
            <div className="small-muted">Graph placeholder — integrate a chart library (e.g., Recharts / Chart.js) if needed</div>
            <div style={{height:120, background:"#fbfdff", borderRadius:8, marginTop:12}} />
          </div>
        </div>

        <aside className="right-column">
          <ProductOverview products={products} />
          <div className="card">
            <div className="row-between">
              <h3 style={{margin:0}}>Top Countries By Sales</h3>
              <a className="view-all" href="#view">View all ▾</a>
            </div>
            <div style={{height:12}} />
            <div><strong>₹37,802</strong> <span style={{color:"green", marginLeft:8}}>▲ 1.56%</span></div>
            <ul style={{marginTop:10, paddingLeft:0}}>
              <li style={{listStyle:"none", marginBottom:8}}>
                <div className="row-between"><div><span style={{marginRight:10}}>🇹🇷</span>Turkish Flag</div><div>6,972</div></div>
              </li>
              <li style={{listStyle:"none", marginBottom:8}}>
                <div className="row-between"><div><span style={{marginRight:10}}>🇧🇪</span>Belgium</div><div>6,972</div></div>
              </li>
              <li style={{listStyle:"none"}}>
                <div className="row-between"><div><span style={{marginRight:10}}>🇸🇪</span>Sweden</div><div>6,972</div></div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
