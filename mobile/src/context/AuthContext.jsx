import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import socketService from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          // Fetch current profile from /auth/me (fallback to /users/me)
          let res;
          try {
            res = await api.get('/auth/me');
          } catch (e) {
            if (e.response?.status === 404) {
              res = await api.get('/users/me');
            } else {
              throw e;
            }
          }
          if (res?.data?.user) {
            setUser(res.data.user);
            socketService.connect(storedToken).catch(() => {});
          }
        }
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.log('Session expired or invalid, clearing storage');
          await AsyncStorage.removeItem('token');
          setToken(null);
          setUser(null);
          socketService.disconnect();
        } else {
          console.warn('Network or server error during auth init:', err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const syncPushToken = async () => {
    try {
      const savedPushToken = await AsyncStorage.getItem('cf_push_token');
      if (savedPushToken) {
        await api.post('/notifications/push-token', {
          token: savedPushToken,
          platform: 'mobile',
        });
      }
    } catch {
      // Ignored
    }
  };

  const login = async (emailOrUsername, password) => {
    const res = await api.post('/auth/login', {
      loginId: emailOrUsername.trim(),
      emailOrUsername: emailOrUsername.trim(),
      password,
    });

    const { token: receivedToken, user: receivedUser } = res.data;
    await AsyncStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    socketService.reconnect(receivedToken).catch(() => {});
    await syncPushToken();
    return receivedUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: receivedToken, user: receivedUser } = res.data;
    await AsyncStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    socketService.reconnect(receivedToken).catch(() => {});
    await syncPushToken();
    return receivedUser;
  };

  const loginGuest = async () => {
    const res = await api.post('/auth/guest');
    const { token: receivedToken, user: receivedUser } = res.data;
    await AsyncStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    socketService.reconnect(receivedToken).catch(() => {});
    return receivedUser;
  };

  const logout = async () => {
    try {
      const savedPushToken = await AsyncStorage.getItem('cf_push_token');
      if (savedPushToken) {
        await api.delete('/notifications/push-token', {
          body: { token: savedPushToken },
        }).catch(() => {});
      }
    } catch {
      // Ignored
    }
    await AsyncStorage.removeItem('token');
    socketService.disconnect();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

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

export default AuthContext;
