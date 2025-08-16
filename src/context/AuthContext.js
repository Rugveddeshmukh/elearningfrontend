import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    const decoded = jwtDecode(newToken);
    setUser(decoded);
    setToken(newToken); // ✅ update token state
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null); // ✅ clear token
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
