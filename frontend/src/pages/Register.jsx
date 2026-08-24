import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EMPTY = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  city: "",
  age: "",
  password: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register({ ...form, age: Number(form.age) });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="card auth-card auth-card-wide" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p className="subtitle">
          Password must be at least 8 characters with one uppercase letter and
          one digit.
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-grid">
          <label>
            First name
            <input
              required
              value={form.first_name}
              onChange={(e) => set("first_name", e.target.value)}
            />
          </label>
          <label>
            Last name
            <input
              required
              value={form.last_name}
              onChange={(e) => set("last_name", e.target.value)}
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </label>
          <label>
            Phone (e.g. +40712345678)
            <input
              required
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </label>
          <label>
            City
            <input
              required
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </label>
          <label>
            Age
            <input
              required
              type="number"
              min="1"
              max="120"
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
            />
          </label>
          <label className="full-width">
            Password
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </label>
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Creating account…" : "Register"}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
