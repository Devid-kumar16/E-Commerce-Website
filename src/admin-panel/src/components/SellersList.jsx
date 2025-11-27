// src/admin/components/SellersList.jsx
import React from "react";

export default function SellersList({ sellers }) {
  return (
    <div className="card">
      <div className="row-between">
        <h3 style={{margin:0}}>Best Shop Sellers</h3>
        <a className="view-all" href="#view">View all ▾</a>
      </div>
      <div style={{height:12}} />

      <div className="sellers-list">
        {sellers.map(s => (
          <div key={s.id} className="seller-row">
            <div className="avatar-thumb">
              {/* fallback circle with initials */}
              {s.avatar ? <img src={s.avatar} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <div style={{padding:8}}>{s.name[0]}</div>}
            </div>
            <div className="meta">
              <div className="name">{s.name}</div>
              <div className="sub">{s.purchases} Purchases • {s.categories}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontWeight:700}}>{s.total}</div>
              <div className="small-muted">Total</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
