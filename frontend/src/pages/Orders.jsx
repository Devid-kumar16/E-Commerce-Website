import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Orders() {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-6">Please login to view your orders.</div>;
  }

  const orders = user.orders || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">My Orders</h2>

      {orders.length === 0 ? (
        <div className="bg-white rounded shadow p-6">
          You have no orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded shadow p-4">
              <div><strong>Order ID:</strong> {o.id}</div>
              <div><strong>Total:</strong> ₹{o.total}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
