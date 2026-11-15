import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import socketService from '../services/socket';
import { getAuthToken, setAuthToken, clearAuthTokens } from '../services/secureStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineMeshMode, setIsOfflineMeshMode] = useState(false);

  // Initialize auth state from SecureStorage and local cache
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Eagerly restore cached user profile for offline cold-start
        const cachedUserRaw = await AsyncStorage.getItem('@cf_cached_user');
        if (cachedUserRaw) {
          try {
            setUser(JSON.parse(cachedUserRaw));
          } catch {}
        }

        const storedToken = await getAuthToken();
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
            await AsyncStorage.setItem('@cf_cached_user', JSON.stringify(res.data.user));
            socketService.connect(storedToken).catch(() => {});
          }
        }
      } catch (err) {
        const isAuthError =
          (err && (err.status === 401 || err.status === 403)) ||
          (err.response && (err.response.status === 401 || err.response.status === 403)) ||
          (err.message && err.message.toLowerCase().includes('token'));

        if (isAuthError) {
          console.log('[Auth] Session expired or invalid, clearing secure storage');
          await clearAuthTokens();
          await AsyncStorage.removeItem('@cf_cached_user');
          setToken(null);
          setUser(null);
          socketService.disconnect();
        } else {
          console.warn('[Auth] Network or server error during auth init (offline mode viable):', err.message);
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
    await setAuthToken(receivedToken);
    await AsyncStorage.setItem('@cf_cached_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    setIsOfflineMeshMode(false);
    socketService.reconnect(receivedToken).catch(() => {});
    await syncPushToken();
    return receivedUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: receivedToken, user: receivedUser } = res.data;
    await setAuthToken(receivedToken);
    await AsyncStorage.setItem('@cf_cached_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    setIsOfflineMeshMode(false);
    socketService.reconnect(receivedToken).catch(() => {});
    await syncPushToken();
    return receivedUser;
  };

  const loginGuest = async () => {
    const res = await api.post('/auth/guest');
    const { token: receivedToken, user: receivedUser } = res.data;
    await setAuthToken(receivedToken);
    await AsyncStorage.setItem('@cf_cached_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    setIsOfflineMeshMode(false);
    socketService.reconnect(receivedToken).catch(() => {});
    return receivedUser;
  };

  // Dedicated Offline Mesh Mode Entry (zero login / zero internet required)
  const enterOfflineMeshMode = () => {
    setIsOfflineMeshMode(true);
  };

  const exitOfflineMeshMode = () => {
    setIsOfflineMeshMode(false);
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
    await clearAuthTokens();
    await AsyncStorage.removeItem('@cf_cached_user');
    socketService.disconnect();
    setToken(null);
    setUser(null);
    setIsOfflineMeshMode(false);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = prev ? { ...prev, ...updatedFields } : null;
      if (updated) {
        AsyncStorage.setItem('@cf_cached_user', JSON.stringify(updated)).catch(() => {});
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isOfflineMeshMode,
        enterOfflineMeshMode,
        exitOfflineMeshMode,
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
