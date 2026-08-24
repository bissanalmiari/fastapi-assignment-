import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [count, avg, cities] = await Promise.all([
          api("/stats/count"),
          api("/stats/average-age"),
          api("/stats/top-cities"),
        ]);
        setStats({
          total: count.total_users,
          averageAge: avg.average_age,
          cities: cities.cities,
        });
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return <div className="page-loading">Loading statistics…</div>;

  const max = Math.max(...stats.cities.map((c) => c.count), 1);

  return (
    <section className="page">
      <div className="page-head">
        <h1>Statistics dashboard</h1>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total active users</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">{stats.averageAge}</span>
          <span className="stat-label">Average age</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">
            {stats.cities[0]?.city ?? "—"}
          </span>
          <span className="stat-label">Top city</span>
        </div>
      </div>

      <div className="card">
        <h2>Top cities</h2>
        {stats.cities.length === 0 ? (
          <p>No users yet.</p>
        ) : (
          <ul className="city-list">
            {stats.cities.map((c) => (
              <li key={c.city}>
                <span className="city-name">{c.city}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(c.count / max) * 100}%` }}
                  />
                </div>
                <span className="city-count">{c.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
