import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [err, setErr] = useState('');
    const submit = (e) => { e.preventDefault(); setErr(''); try { login(form); navigate('/profile'); } catch (ex) { setErr(ex.message); } };
    return (
        <div className="max-w-md mx-auto px-4 py-12"><div className="bg-white rounded shadow p-6"><h2 className="text-xl font-semibold mb-4">Login</h2><form onSubmit={submit} className="space-y-4"><div><label className="block text-sm">Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border p-2 rounded" /></div><div><label className="block text-sm">Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full border p-2 rounded" /></div>{err && <div className="text-sm text-red-600">{err}</div>}<div className="flex gap-2"><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Login</button><Link to="/signup" className="px-4 py-2 border rounded">Signup</Link></div></form></div></div>
    );
}