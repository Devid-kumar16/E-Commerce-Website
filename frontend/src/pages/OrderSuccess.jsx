import React from "react";
import { Link, useParams } from "react-router-dom";

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>🎉 Order Placed Successfully!</h2>
      <p>Your Order ID: <strong>{id}</strong></p>

      <Link to="/">Go to Home</Link>
    </div>
  );
}
