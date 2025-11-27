import React, { createContext, useContext, useEffect, useState } from 'react';
const AUTH_KEY = 'estore_auth_v1';


const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k) || fallback); } catch { return JSON.parse(fallback); } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));


const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }


export function AuthProvider({ children }) {
const [user, setUser] = useState(() => read(AUTH_KEY, 'null'));


useEffect(() => write(AUTH_KEY, user), [user]);


const readUsers = () => read(USERS_KEY, '[]');
const saveUsers = (u) => write(USERS_KEY, u);


const signup = ({ name, email, password }) => {
const users = readUsers();
if (!name || !email || !password) throw new Error('All fields required');
if (users.find(u => u.email === email)) throw new Error('User already exists');
const newUser = { id: Date.now(), name, email, password, createdAt: new Date().toISOString(), orders: [] };
users.push(newUser);
saveUsers(users);
setUser({ id: newUser.id, name: newUser.name, email: newUser.email });
};


const login = ({ email, password }) => {
const users = readUsers();
const found = users.find(u => u.email === email && u.password === password);
if (!found) throw new Error('Invalid credentials');
setUser({ id: found.id, name: found.name, email: found.email });
};


const logout = () => { setUser(null); write(AUTH_KEY, null); };


return (
<AuthContext.Provider value={{ user, signup, login, logout }}>
{children}
</AuthContext.Provider>
);
}