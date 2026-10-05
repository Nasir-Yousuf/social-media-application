import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse518_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('pulse518_token'));
  const [loading, setLoading] = useState(true);

  // Refresh profile from server on boot
  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('pulse518_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('pulse518_user', JSON.stringify(res.data.user));
    } catch (err) {
      console.warn('Failed to refresh user profile:', err.response?.data?.message || err.message);
      setUser(null);
      setToken(null);
      localStorage.removeItem('pulse518_token');
      localStorage.removeItem('pulse518_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Login handler
  const login = async (loginId, password) => {
    const res = await api.post('/auth/login', { loginId, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('pulse518_token', newToken);
    localStorage.setItem('pulse518_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  // Register handler
  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('pulse518_token', newToken);
    localStorage.setItem('pulse518_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  // Guest login handler
  const loginGuest = async () => {
    const res = await api.post('/auth/guest');
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('pulse518_token', newToken);
    localStorage.setItem('pulse518_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('pulse518_token');
    localStorage.removeItem('pulse518_user');
    setToken(null);
    setUser(null);
  };

  // Local state update when editing profile
  const updateUser = (updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('pulse518_user', JSON.stringify(merged));
      return merged;
    });
  };

  // Synchronize authenticated user stats dynamically whenever follow actions occur
  useEffect(() => {
    const handleFollowUpdated = (e) => {
      const detail = e.detail;
      if (!detail) return;

      setUser((prev) => {
        if (!prev) return prev;
        let changed = false;
        const next = { ...prev };

        if (typeof detail.currentUserFollowingCount === 'number') {
          next.followingCount = detail.currentUserFollowingCount;
          changed = true;
        }
        if (typeof detail.currentUserFollowersCount === 'number') {
          next.followersCount = detail.currentUserFollowersCount;
          changed = true;
        }

        if (changed) {
          localStorage.setItem('pulse518_user', JSON.stringify(next));
          return next;
        }
        return prev;
      });
    };

    window.addEventListener('clearfeed:followUpdated', handleFollowUpdated);
    return () => window.removeEventListener('clearfeed:followUpdated', handleFollowUpdated);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        loginGuest,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
