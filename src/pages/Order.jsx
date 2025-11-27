import React from 'react';
import { useAuth } from '../context/AuthContext';


export default function Orders() {
    const { user } = useAuth();
    const users = (() => { try { return JSON.parse(localStorage.getItem('estore_users_v1') || '[]') } catch { return [] } })();
    const cur = users.find(u => u.id === user.id);
    const orders = (cur && cur.orders) || [];
    return (<div className="max-w-4xl mx-auto px-4 py-8"><h2 className="text-2xl font-semibold mb-4">Orders</h2>{orders.length === 0 ? <div className="bg-white rounded shadow p-6">You have no orders yet.</div> : (<div className="space-y-4">{orders.map(o => <div key={o.id} className="bg-white rounded shadow p-4">Order #{o.id} - ₹{o.total}</div>)}</div>)}</div>);
}