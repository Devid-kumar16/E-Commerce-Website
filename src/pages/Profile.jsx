import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { read as readLocal } from '../utils/localHelpers';


export default function Profile() {
    const { user } = useAuth();
    const [users] = useState(() => { try { return JSON.parse(localStorage.getItem('estore_users_v1') || '[]'); } catch { return []; } });
    const cur = users.find(u => u.id === user.id) || user;
    return (<div className="max-w-4xl mx-auto px-4 py-8"><h2 className="text-2xl font-semibold mb-4">Profile</h2><div className="bg-white rounded shadow p-6"><div><strong>Name:</strong> {cur.name}</div><div className="mt-2"><strong>Email:</strong> {cur.email}</div><div className="mt-4"><a href="/orders" className="text-blue-600">View Orders</a></div></div></div>);
}