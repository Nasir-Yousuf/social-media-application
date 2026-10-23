import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '../api/client';
import socketService from '../services/socket';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  backendConnected: boolean;
  login: (credentials: { usernameOrEmail: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  register: (payload: { name: string; username: string; email: string; password: string; studentId?: string; coursePasscode: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('pulse518_token');
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('pulse518_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [backendConnected, setBackendConnected] = useState<boolean>(true);

  const checkAuth = useCallback(async () => {
    const currentToken = localStorage.getItem('pulse518_token');
    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('pulse518_user', JSON.stringify(res.data.user));
        setBackendConnected(true);
        socketService.connect(currentToken);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
      } else {
        // Backend temporarily unreachable; keep cached user and mark backendConnected false
        setBackendConnected(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: { usernameOrEmail: string; password: string }) => {
    try {
      const res = await api.post('/auth/login', {
        usernameOrEmail: credentials.usernameOrEmail.trim(),
        password: credentials.password,
      });

      const { token: receivedToken, user: receivedUser } = res.data;
      if (receivedToken && receivedUser) {
        setToken(receivedToken);
        setUser(receivedUser);
        setBackendConnected(true);
        localStorage.setItem('pulse518_token', receivedToken);
        localStorage.setItem('pulse518_user', JSON.stringify(receivedUser));
        socketService.connect(receivedToken);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server.' };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message: msg };
    }
  };

  const register = async (payload: {
    name: string;
    username: string;
    email: string;
    password: string;
    studentId?: string;
    coursePasscode: string;
  }) => {
    try {
      const res = await api.post('/auth/register', payload);
      const { token: receivedToken, user: receivedUser } = res.data;
      if (receivedToken && receivedUser) {
        setToken(receivedToken);
        setUser(receivedUser);
        setBackendConnected(true);
        localStorage.setItem('pulse518_token', receivedToken);
        localStorage.setItem('pulse518_user', JSON.stringify(receivedUser));
        socketService.connect(receivedToken);
        return { success: true };
      }
      return { success: false, message: 'Registration completed without session.' };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pulse518_token');
    localStorage.removeItem('pulse518_user');
    socketService.disconnect();
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      localStorage.setItem('pulse518_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        backendConnected,
        login,
        register,
        logout,
        updateUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
