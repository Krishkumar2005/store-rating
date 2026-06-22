import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          console.log("get me ", res)
          setUser(res.data.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.data.user));
        } catch (err) {
          if (err.response?.status === 401) {
            logout();
          } else {
            console.error("Could not verify session (non-auth error):", err.message);
          }
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  const login = useCallback((userData, tokenValue) => {

    console.log("befor in context ", token)
    setUser(userData);
    setToken(tokenValue);
    
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenValue);

    console.log("after in context ", localStorage.getItem("token"))
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
