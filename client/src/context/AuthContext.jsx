import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('on_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    const token = localStorage.getItem('on_token');
    if (token) {
      apiRequest('/auth/me')
        .then(res => {
          setUser(res.user);
          localStorage.setItem('on_user', JSON.stringify(res.user));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    const handleUnauthorized = () => {
      setUser(null);
      showToast('Session expired. Please sign in again.', 'warning');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (username, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    localStorage.setItem('on_token', data.token);
    localStorage.setItem('on_user', JSON.stringify(data.user));
    setUser(data.user);
    showToast(`Welcome back, ${data.user.name}!`);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('on_token');
    localStorage.removeItem('on_user');
    setUser(null);
    showToast('Signed out successfully.', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, toast, showToast }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
