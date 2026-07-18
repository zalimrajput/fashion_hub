import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("fh_token"));
  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem("fh_admin");
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post("/api/admin/login", { email, password });
    localStorage.setItem("fh_token", data.token);
    localStorage.setItem("fh_admin", JSON.stringify(data.data));
    setToken(data.token);
    setAdmin(data.data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/api/admin/register", payload);
    localStorage.setItem("fh_token", data.token);
    localStorage.setItem("fh_admin", JSON.stringify(data.data));
    setToken(data.token);
    setAdmin(data.data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("fh_token");
    localStorage.removeItem("fh_admin");
    setToken(null);
    setAdmin(null);
  };

  const value = useMemo(
    () => ({
      token,
      admin,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, admin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
