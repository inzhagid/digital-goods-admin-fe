import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = ({ email, role }) => {
    const fakeToken = crypto.randomUUID();
    const normalizeRole = role.toLowerCase();

    setToken(fakeToken);
    setUser({ email, role: normalizeRole });

    localStorage.setItem("dg_token", fakeToken);
    localStorage.setItem(
      "dg_user",
      JSON.stringify({ email, role: normalizeRole }),
    );
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("dg_token");
    localStorage.removeItem("dg_user");
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("dg_token");
    const savedUser = localStorage.getItem("dg_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.warn("Auth data is broken, reset:", error);
        localStorage.removeItem("dg_token");
        localStorage.removeItem("dg_user");
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used in AuthProvider");
  return context;
}
