// src/context/AuthContext.jsx — Global auth state with JWT persistence
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const getAPIBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (import.meta.env.PROD) {
    // In production, use relative URL (same origin)
    return '';
  }
  
  // Development: use localhost:5000
  return 'http://localhost:5000';
};

const API_BASE = getAPIBase();

function parseJWT(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  // Restore session from stored token
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem('auth_token');
      if (!storedToken) { setLoading(false); return; }

      // Check token expiry locally first
      const decoded = parseJWT(storedToken);
      if (!decoded || decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('auth_token');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('auth_token');
        }
      } catch {
        // Network error — use decoded token data as fallback
        setUser({ id: decoded.id, username: decoded.username, role: decoded.role });
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Login failed');

    localStorage.setItem('auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
