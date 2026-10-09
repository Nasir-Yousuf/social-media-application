import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Notifications from '../services/notificationService';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { isRunningInExpoGo } from 'expo';
import api from '../api/client';

// Configure how notifications should be handled when app is in the foreground
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch {
  // Ignored in restricted environments
}

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [pushToken, setPushToken] = useState(null);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState('undetermined');
  const [toast, setToast] = useState(null); // { message, type: 'info'|'success'|'error' }

  // Deep-link navigation callback registered by AppNavigator
  const navigationRef = useRef(null);

  const setNavigationRef = useCallback((ref) => {
    navigationRef.current = ref;
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Update OS application badge
  const updateBadgeCount = useCallback(async (totalCount) => {
    try {
      if (Platform.OS !== 'web' && !(isRunningInExpoGo() && Platform.OS === 'android')) {
        await Notifications.setBadgeCountAsync(Math.max(0, totalCount));
      }
    } catch {
      // Ignored if platform does not support badges
    }
  }, []);

  // Fetch unread social alerts and direct messages count
  const fetchUnreadCounts = useCallback(async () => {
    try {
      const [notifsRes, msgsRes] = await Promise.allSettled([
        api.get('/notifications/unread-count'),
        api.get('/messages/unread-total'),
      ]);

      let notifCount = 0;
      let msgCount = 0;

      if (notifsRes.status === 'fulfilled') {
        notifCount = notifsRes.value.data.unreadCount || 0;
        setUnreadCount(notifCount);
      }
      if (msgsRes.status === 'fulfilled') {
        msgCount = msgsRes.value.data.unreadTotal || 0;
        setUnreadMessagesCount(msgCount);
      }

      updateBadgeCount(notifCount + msgCount);
    } catch {
      // Ignored if not authenticated
    }
  }, [updateBadgeCount]);

  // Setup Android notification channels
  const setupNotificationChannels = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'General Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1d9bf0',
          showBadge: true,
        });

        await Notifications.setNotificationChannelAsync('messages', {
          name: 'Direct Messages',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1d9bf0',
          sound: 'default',
          showBadge: true,
        });

        await Notifications.setNotificationChannelAsync('social', {
          name: 'Social Interactions',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 200, 200],
          lightColor: '#1d9bf0',
          showBadge: true,
        });
      } catch (err) {
        console.warn('Failed to configure Android notification channels:', err.message);
      }
    }
  }, []);

  // Register device for push notifications
  const registerForPushNotifications = useCallback(async (interactive = false) => {
    try {
      // In Expo Go on Android (SDK 53+), remote FCM notifications are not supported in the client shell.
      // Standalone APK and Development builds support full native push tokens.
      if (isRunningInExpoGo() && Platform.OS === 'android') {
        setNotificationPermissionStatus('expo-go-android');
        return { success: false, reason: 'Expo Go Android limitation' };
      }

      await setupNotificationChannels();

      if (!Device.isDevice && Platform.OS !== 'android') {
        // Simulators on iOS don't support remote APNs push tokens
        console.log('Push notifications require a physical device or Android emulator.');
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Only prompt if undetermined or explicitly requested
      if (existingStatus !== 'granted') {
        if (interactive || existingStatus === 'undetermined') {
          const { status } = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
            },
          });
          finalStatus = status;
        }
      }

      setNotificationPermissionStatus(finalStatus);

      if (finalStatus !== 'granted') {
        return { success: false, status: finalStatus };
      }

      // Get Expo Push Token
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ||
        Constants?.easConfig?.projectId;

      let token = null;
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        );
        token = tokenData?.data;
      } catch (tokenErr) {
        console.warn('[Push] Could not acquire push token:', tokenErr.message);
        return { success: false, error: tokenErr.message };
      }

      if (token) {
        setPushToken(token);
        await AsyncStorage.setItem('cf_push_token', token);

        // Send to backend API if authenticated
        try {
          await api.post('/notifications/push-token', {
            token,
            platform: Platform.OS,
          });
        } catch {
          // Token will be synced upon next login
        }

        return { success: true, token };
      }

      return { success: false, reason: 'No token received' };
    } catch (err) {
      console.warn('Error registering for push notifications:', err.message);
      return { success: false, error: err.message };
    }
  }, [setupNotificationChannels]);

  // Unregister push token (called on logout)
  const unregisterPushToken = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('cf_push_token');
      if (stored) {
        await api.delete('/notifications/push-token', {
          body: { token: stored },
        }).catch(() => {});
        await AsyncStorage.removeItem('cf_push_token');
      }
      setPushToken(null);
      await updateBadgeCount(0);
    } catch {
      // Ignored
    }
  }, [updateBadgeCount]);

  // Handle tap on notification banner
  const handleNotificationResponse = useCallback((response) => {
    try {
      const data = response?.notification?.request?.content?.data || {};
      const nav = navigationRef.current;
      if (!nav) return;

      if (data.type === 'message' && data.conversationId) {
        nav.navigate('Conversation', {
          conversationId: data.conversationId,
          otherUser: data.senderId
            ? { _id: data.senderId, name: data.senderName, username: data.senderUsername }
            : null,
        });
      } else if (data.type === 'post' || data.postId) {
        nav.navigate('PostDetail', { postId: data.postId });
      } else if (data.type === 'follow' && data.username) {
        nav.navigate('Profile', { username: data.username });
      } else {
        nav.navigate('MainTabs', { screen: 'Notifications' });
      }
    } catch (err) {
      console.warn('Notification deep link navigation error:', err.message);
    }
  }, []);

  // Setup listeners
  useEffect(() => {
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 20000);

    // Initial background channel setup & quiet token registration check
    registerForPushNotifications(false);

    let notifReceivedSub = null;
    let responseSub = null;

    try {
      notifReceivedSub = Notifications.addNotificationReceivedListener((notification) => {
        fetchUnreadCounts();
      });

      responseSub = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    } catch (err) {
      console.warn('Notification listeners could not be attached:', err.message);
    }

    return () => {
      clearInterval(interval);
      try {
        notifReceivedSub?.remove();
        responseSub?.remove();
      } catch {}
    };
  }, [fetchUnreadCounts, registerForPushNotifications, handleNotificationResponse]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        unreadMessagesCount,
        setUnreadMessagesCount,
        fetchUnreadCount: fetchUnreadCounts,
        pushToken,
        notificationPermissionStatus,
        registerForPushNotifications,
        unregisterPushToken,
        setNavigationRef,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
