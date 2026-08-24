import { useState } from "react";
import { api } from "../api/client";

const EMPTY = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  city: "",
  age: "",
  password: "",
  type: "client",
};

export default function UserFormModal({ initial, onClose, onSaved }) {
  const editing = Boolean(initial?.id);
  const [form, setForm] = useState(() =>
    editing ? { ...EMPTY, ...initial, password: "" } : EMPTY
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        city: form.city,
        age: Number(form.age),
        type: form.type,
      };
      if (form.password) body.password = form.password;
      else delete body.password;

      if (editing) {
        await api(`/users/${initial.id}`, { method: "PUT", body });
      } else {
        await api("/users", { method: "POST", body });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <h2>{editing ? `Edit user #${initial.id}` : "Create user"}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="form-grid">
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
          <label>
            Role
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
            >
              <option value="client">client</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <label>
            Password{" "}
            {editing && <small>(leave blank to keep current)</small>}
            <input
              required={!editing}
              type="password"
              value={form.password}
              placeholder={editing ? "••••••••" : ""}
              onChange={(e) => set("password", e.target.value)}
            />
          </label>
          {!editing && (
            <small className="hint">
              Min 8 chars, at least one uppercase letter and one digit.
            </small>
          )}
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
