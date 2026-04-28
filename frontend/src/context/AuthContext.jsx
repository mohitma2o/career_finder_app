import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cf_token'));
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser({
            username: decoded.sub,
            role: decoded.role,
            id: decoded.id
          });
        }
      } catch (error) {
        console.error("Invalid token", error);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      const { access_token, user: userInfo } = response.data;
      
      setToken(access_token);
      setUser(userInfo);
      localStorage.setItem('cf_token', access_token);
      return { success: true };
    } catch (error) {
      console.error("Login failed", error);
      return { success: false, error: error.response?.data?.detail || "Login failed" };
    }
  };

  const register = async (username, password) => {
    try {
      await axios.post(`${API_URL}/auth/register`, { username, password });
      return { success: true };
    } catch (error) {
      console.error("Registration failed", error);
      return { success: false, error: error.response?.data?.detail || "Registration failed" };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cf_token');
  };

  const isAdmin = () => user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = () => user?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
