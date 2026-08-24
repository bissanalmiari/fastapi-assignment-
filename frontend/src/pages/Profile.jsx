import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const Icon = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const PhoneIcon = () => (
  <Icon>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Icon>
);

const CityIcon = () => (
  <Icon>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

const CalendarIcon = () => (
  <Icon>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Icon>
);

const HashIcon = () => (
  <Icon>
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </Icon>
);

const ShieldIcon = () => (
  <Icon>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 11.5 11.5 14 15.5 9.5" />
  </Icon>
);

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const initials =
    `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();
  const joined = new Date(user.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function startEdit() {
    setError("");
    setNotice("");
    setForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      age: user.age,
      password: "",
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = {};
      for (const key of [
        "first_name",
        "last_name",
        "email",
        "phone",
        "city",
        "age",
      ]) {
        if (String(form[key]) !== String(user[key])) body[key] = form[key];
      }
      if (form.password) body.password = form.password;

      if (Object.keys(body).length === 0) {
        setNotice("Nothing to update.");
        setEditing(false);
        return;
      }
      await api("/users/me", { method: "PUT", body });
      await refreshUser();
      setNotice("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <section className="page">
        <div className="page-head">
          <h1>My profile</h1>
          <button className="btn btn-primary" onClick={startEdit}>
            Edit profile
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {notice && <div className="alert alert-success">{notice}</div>}

        <div className="profile-layout">
          <div className="card profile-hero">
            <div className="hero-banner" />
            <div className="hero-body">
              <div className={`avatar avatar-${user.type}`}>{initials}</div>
              <div className="hero-info">
                <h2>
                  {user.first_name} {user.last_name}
                </h2>
                <p className="hero-email">{user.email}</p>
                <div className="hero-meta">
                  <span className={`tag tag-${user.type}`}>{user.type}</span>
                  <span className="meta-item">Member since {joined}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-tile">
              <span className="tile-icon">
                <PhoneIcon />
              </span>
              <span>
                <span className="tile-label">Phone</span>
                <span className="tile-value">{user.phone}</span>
              </span>
            </div>
            <div className="info-tile">
              <span className="tile-icon">
                <CityIcon />
              </span>
              <span>
                <span className="tile-label">City</span>
                <span className="tile-value">{user.city}</span>
              </span>
            </div>
            <div className="info-tile">
              <span className="tile-icon">
                <CalendarIcon />
              </span>
              <span>
                <span className="tile-label">Age</span>
                <span className="tile-value">{user.age} years</span>
              </span>
            </div>
            <div className="info-tile">
              <span className="tile-icon">
                <HashIcon />
              </span>
              <span>
                <span className="tile-label">User ID</span>
                <span className="tile-value">#{user.id}</span>
              </span>
            </div>
            <div className="info-tile">
              <span className="tile-icon">
                <ShieldIcon />
              </span>
              <span>
                <span className="tile-label">Status</span>
                <span className="tile-value">
                  <span className="status-dot" />
                  Active account
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-head">
        <h1>Edit profile</h1>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setEditing(false)}
        >
          Back to profile
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <form className="card form-card" onSubmit={handleSave}>
        <div className="form-section">
          <h3>Personal information</h3>
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
              Phone
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
          </div>
        </div>

        <div className="form-section">
          <h3>Security</h3>
          <div className="form-grid">
            <label>
              New password <small>(leave blank to keep current)</small>
              <input
                type="password"
                value={form.password}
                placeholder="••••••••"
                onChange={(e) => set("password", e.target.value)}
              />
            </label>
          </div>
          <small className="hint">
            Min 8 characters, at least one uppercase letter and one digit.
          </small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
