import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to your account</p>
        {error && <div className="alert alert-error">{error}</div>}
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Signing in…" : "Login"}
        </button>
        <p className="auth-switch">
          No account yet? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
}
