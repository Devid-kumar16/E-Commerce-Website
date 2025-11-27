// src/admin/components/Topbar.jsx
import React from "react";
export default function Topbar(){
  return (
    <header className="topbar">
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button className="btn secondary" title="toggle sidebar">☰</button>
        <div className="brand">Remos Admin</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <input placeholder="Search products, categories..." style={{padding:8,borderRadius:8,border:"1px solid #e6eef7"}} />
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontWeight:700}}>Admin</div>
            <div className="small">admin@remos.com</div>
          </div>
        </div>
      </div>
    </header>
  );
}
