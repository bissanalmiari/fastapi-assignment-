import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import Pagination from "../components/Pagination";
import UserFormModal from "../components/UserFormModal";

const EMPTY_FILTERS = {
  first_name: "",
  last_name: "",
  email: "",
  city: "",
  type: "",
  age: "",
};

export default function Users() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadUsers = useCallback(
    async (targetPage = page, activeFilters = applied) => {
      setError("");
      try {
        const params = new URLSearchParams({ page: targetPage, limit: 10 });
        for (const [key, value] of Object.entries(activeFilters)) {
          if (value !== "") params.set(key, value);
        }
        const result = await api(`/users?${params}`);
        setData(result);
        if (result.users.length === 0 && result.page > 1) {
          setPage(result.total_pages || 1);
        }
      } catch (err) {
        setError(err.message);
      }
    },
    [page, applied]
  );

  useEffect(() => {
    loadUsers(page, applied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, applied]);

  function applyFilters(e) {
    e.preventDefault();
    setPage(1);
    setApplied(filters);
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
    setApplied(EMPTY_FILTERS);
  }

  async function handleDelete(u) {
    if (
      !window.confirm(
        `Soft-delete ${u.first_name} ${u.last_name} (${u.email})?`
      )
    )
      return;
    setNotice("");
    try {
      await api(`/users/${u.id}`, { method: "DELETE" });
      setNotice(`User #${u.id} deleted.`);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="page">
      <div className="page-head">
        <h1>Admin · User management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setModal({ mode: "create" })}
        >
          + New user
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <form className="card filters" onSubmit={applyFilters}>
        <input
          placeholder="First name"
          value={filters.first_name}
          onChange={(e) => setFilters({ ...filters, first_name: e.target.value })}
        />
        <input
          placeholder="Last name"
          value={filters.last_name}
          onChange={(e) => setFilters({ ...filters, last_name: e.target.value })}
        />
        <input
          placeholder="Email"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
        />
        <input
          placeholder="City"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">Any role</option>
          <option value="client">client</option>
          <option value="admin">admin</option>
        </select>
        <input
          placeholder="Age"
          type="number"
          min="1"
          max="120"
          value={filters.age}
          onChange={(e) => setFilters({ ...filters, age: e.target.value })}
        />
        <div className="filter-actions">
          <button className="btn btn-primary">Filter</button>
          <button type="button" className="btn btn-outline" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </form>

      <div className="card table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Age</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!data && (
              <tr>
                <td colSpan="8" className="empty-row">
                  Loading…
                </td>
              </tr>
            )}
            {data?.users?.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-row">
                  No users match these filters.
                </td>
              </tr>
            )}
            {data?.users?.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>
                  {u.first_name} {u.last_name}
                </td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.city}</td>
                <td>{u.age}</td>
                <td>
                  <span className={`tag tag-${u.type}`}>{u.type}</span>
                </td>
                <td className="row-actions">
                  <button
                    className="btn btn-small"
                    onClick={() => setModal({ mode: "edit", user: u })}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(u)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && (
          <Pagination
            page={data.page}
            totalPages={data.total_pages}
            onChange={setPage}
          />
        )}
      </div>

      {modal && (
        <UserFormModal
          initial={modal.mode === "edit" ? modal.user : null}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            setNotice("User saved.");
            loadUsers();
          }}
        />
      )}
    </section>
  );
}
