
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../services/authService";

import { clearTokens } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        if (sessionStorage.getItem("refresh_token")) {
          const currentUser = await getCurrentUser();
          if (active) setUser(currentUser);
        }
      } catch {
        clearTokens();
      } finally {
        if (active) setLoading(false);
      }
    };

    restoreSession();

    const handleExpired = () => setUser(null);
    window.addEventListener("auth:expired", handleExpired);

    return () => {
      active = false;
      window.removeEventListener("auth:expired", handleExpired);
    };
  }, []);

  const login = async (credentials) => {
    await loginUser(credentials);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be inside AuthProvider");
  }

  return context;
}
