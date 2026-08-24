import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import Stats from "./pages/Stats";

function Shell() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/stats" replace />;
  return user.type === "admin" ? (
    <Navigate to="/users" replace />
  ) : (
    <Navigate to="/profile" replace />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Shell />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/stats" element={<Stats />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute adminOnly>
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
