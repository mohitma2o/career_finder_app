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
      if (token.startsWith('mock-token-')) {
        const mockUser = JSON.parse(localStorage.getItem('cf_user_mock'));
        if (mockUser) setUser(mockUser);
        setLoading(false);
        return;
      }

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
      // Try API first
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      const { access_token, user: userInfo } = response.data;
      
      setToken(access_token);
      setUser(userInfo);
      localStorage.setItem('cf_token', access_token);
      return { success: true };
    } catch (error) {
      console.warn("Backend auth failed, trying local fallback...", error);
      
      // Local Fallback (Mock Mode)
      if (username === 'mohit' && password === 'mohit2045') {
        const mockUser = { username: 'mohit', role: 'super_admin', id: '1' };
        setUser(mockUser);
        setToken('mock-token-super');
        localStorage.setItem('cf_token', 'mock-token-super');
        localStorage.setItem('cf_user_mock', JSON.stringify(mockUser));
        return { success: true };
      }

      // Check for locally registered users
      const localUsers = JSON.parse(localStorage.getItem('cf_local_users') || '[]');
      const found = localUsers.find(u => u.username === username && u.password === password);
      if (found) {
        const mockUser = { username: found.username, role: found.role, id: found.id };
        setUser(mockUser);
        setToken(`mock-token-${found.id}`);
        localStorage.setItem('cf_token', `mock-token-${found.id}`);
        localStorage.setItem('cf_user_mock', JSON.stringify(mockUser));
        return { success: true };
      }

      return { success: false, error: "Invalid credentials or backend unavailable" };
    }
  };

  const register = async (username, password) => {
    try {
      // Try API first
      await axios.post(`${API_URL}/auth/register`, { username, password });
      return { success: true };
    } catch (error) {
      console.warn("Backend registration failed, using local storage...", error);
      
      const localUsers = JSON.parse(localStorage.getItem('cf_local_users') || '[]');
      if (localUsers.find(u => u.username === username)) {
        return { success: false, error: "Username already exists locally" };
      }

      localUsers.push({ id: Date.now().toString(), username, password, role: 'user' });
      localStorage.setItem('cf_local_users', JSON.stringify(localUsers));
      return { success: true };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cf_token');
    localStorage.removeItem('cf_user_mock');
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
