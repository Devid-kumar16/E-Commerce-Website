// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";         // make sure this path is correct
import { signup } from "../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // may be login(user, token) or login(token)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    console.log("Signup submit clicked", form);

    try {
      // call signup API (should return { token, user })
      const res = await signup(form);
      // tolerate both shapes: { token, user } or { user, token }
      const token = res?.token ?? res?.data?.token ?? (res?.user && res?.token ? res.token : null);
      const user = res?.user ?? res?.data?.user ?? (res?.user ? res.user : null);

      // some APIs might return { user, token } swapped — handle a fallback:
      let finalToken = token;
      let finalUser = user;
      if (!finalToken && res?.data && typeof res.data === "object") {
        finalToken = res.data.token || res.token;
        finalUser = res.data.user || res.user;
      }

      // If still missing, try simple fallbacks
      if (!finalUser && res?.user) finalUser = res.user;
      if (!finalToken && res?.token) finalToken = res.token;

      if (!finalToken || !finalUser) {
        // show the raw response in console for debugging
        console.error("Unexpected signup response:", res);
        throw new Error("Unexpected response from server (no token/user). Check console.");
      }

      // set axios default header so subsequent requests include Authorization
      api.defaults.headers.common["Authorization"] = `Bearer ${finalToken}`;
      // persist to localStorage (frontend expects this in many places)
      localStorage.setItem("token", finalToken);
      localStorage.setItem("user", JSON.stringify(finalUser));

      // Call context login if available (tolerant signature)
      try {
        if (typeof login === "function") {
          // try login(user, token) first
          try {
            login(finalUser, finalToken);
          } catch (e) {
            // fallback: login(token) or login({ user, token })
            try {
              login(finalToken);
            } catch (e2) {
              try {
                login({ user: finalUser, token: finalToken });
              } catch (e3) {
                console.warn("AuthContext.login failed with multiple signatures", e, e2, e3);
              }
            }
          }
        }
      } catch (e) {
        console.warn("Error calling login() from context:", e);
      }

      // Support both newUser.roles (array) and legacy newUser.role (string)
      const rolesArray =
        Array.isArray(finalUser.roles) && finalUser.roles.length
          ? finalUser.roles
          : finalUser.role
          ? [finalUser.role]
          : [];

      // Redirect based on role
      if (rolesArray.includes("admin")) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (ex) {
      console.error("Signup failed:", ex);
      // If axios error with response body -> show server message
      const message =
        (ex && ex.response && ex.response.data && ex.response.data.message) ||
        (ex && ex.message) ||
        "Signup failed";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page" style={{ padding: 20 }}>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <label>Full name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            required
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            minLength={6}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>

        {err && (
          <p style={{ color: "red", marginTop: 8 }}>
            {err}
          </p>
        )}

        <button type="submit" disabled={loading} style={{ padding: "10px 18px" }}>
          {loading ? "Signing up…" : "Sign up"}
        </button>
      </form>
    </div>
  );
}
