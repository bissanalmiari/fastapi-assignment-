import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        UserManager
      </Link>
      <nav className="nav-links">
        <NavLink to="/stats">Statistics</NavLink>
        {user && <NavLink to="/profile">My Profile</NavLink>}
        {user?.type === "admin" && <NavLink to="/users">Users</NavLink>}
      </nav>
      <div className="navbar-right">
        {user ? (
          <>
            <span className="user-badge">
              {user.first_name} · <em>{user.type}</em>
            </span>
            <button className="btn btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
