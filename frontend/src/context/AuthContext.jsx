import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const me = await api("/users/me");
    setUser(me);
    return me;
  }, []);

  useEffect(() => {
    async function init() {
      if (!localStorage.getItem("token")) {
        setLoading(false);
        return;
      }
      try {
        await fetchMe();
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [fetchMe]);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await api("/login", {
        method: "POST",
        body: { email, password },
      });
      localStorage.setItem("token", data.access_token);
      await fetchMe();
    },
    [fetchMe]
  );

  const register = useCallback(
    async (payload) => {
      await api("/register", { method: "POST", body: payload });
      await login(payload.email, payload.password);
    },
    [login]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser: fetchMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
