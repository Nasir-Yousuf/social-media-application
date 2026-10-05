import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

// Gentle synthesized notification chime (no external audio assets needed)
const playMessageChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Ignore audio restrictions before user gesture
  }
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [toast, setToast] = useState(null);

  const notifiedMessageIdsRef = React.useRef(new Set());
  const initialLoadRef = React.useRef(true);

  const showToast = useCallback((message, type = 'info', options = {}) => {
    setToast({
      id: Date.now(),
      message,
      type,
      onClick: options.onClick,
      avatarUrl: options.avatarUrl,
    });
    setTimeout(() => {
      setToast(null);
    }, options.duration || 4000);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setUnreadMessagesCount(0);
      return;
    }
    try {
      const [notifRes, msgRes] = await Promise.all([
        api.get('/notifications/unread-count').catch(() => ({ data: {} })),
        api.get('/messages/unread-total').catch(() => ({ data: {} })),
      ]);

      const newNotifCount = notifRes.data.unreadCount || 0;
      const newMsgCount = msgRes.data.unreadTotal || 0;
      const latestUnread = msgRes.data.latestUnread;

      setUnreadCount(newNotifCount);
      setUnreadMessagesCount(newMsgCount);

      // Handle new incoming message notification
      if (latestUnread && latestUnread._id) {
        if (initialLoadRef.current) {
          notifiedMessageIdsRef.current.add(latestUnread._id);
        } else if (!notifiedMessageIdsRef.current.has(latestUnread._id)) {
          notifiedMessageIdsRef.current.add(latestUnread._id);

          // Only alert if user is not actively viewing this conversation
          const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
          const isViewingThisChat =
            currentUrl.includes('/messages') &&
            currentUrl.includes(`user=${latestUnread.sender?.username}`);

          if (!isViewingThisChat) {
            playMessageChime();
            showToast(
              `💬 ${latestUnread.sender?.name || 'Someone'}: "${(latestUnread.text || 'Sent a message').slice(0, 45)}"`,
              'info',
              {
                avatarUrl: latestUnread.sender?.avatarUrl,
                onClick: () => {
                  window.location.assign(`/messages?user=${latestUnread.sender?.username}`);
                },
                duration: 5000,
              }
            );

            // Native Browser Notification
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              try {
                new Notification(`Message from ${latestUnread.sender?.name || 'Classmate'}`, {
                  body: latestUnread.text || 'Sent you a direct message.',
                  icon: latestUnread.sender?.avatarUrl || undefined,
                });
              } catch {
                // Fallback
              }
            }
          }
        }
      }

      initialLoadRef.current = false;
    } catch {
      // Ignore background notification fetch errors
    }
  }, [isAuthenticated, showToast]);

  // Request browser notification permission once politely on first user interaction
  useEffect(() => {
    if (
      isAuthenticated &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      const requestPermission = () => {
        Notification.requestPermission().catch(() => {});
        window.removeEventListener('click', requestPermission);
      };
      window.addEventListener('click', requestPermission, { once: true });
      return () => window.removeEventListener('click', requestPermission);
    }
  }, [isAuthenticated]);

  const markAllNotificationsAsRead = useCallback(async () => {
    setUnreadCount(0);
    try {
      await api.patch('/notifications/mark-read', {});
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  }, []);

  useEffect(() => {
    const handleNotificationsRead = () => {
      setUnreadCount(0);
    };
    window.addEventListener('clearfeed:notificationsRead', handleNotificationsRead);
    return () => window.removeEventListener('clearfeed:notificationsRead', handleNotificationsRead);
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 5 seconds for fast real-time message notification
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchUnreadCount();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        unreadMessagesCount,
        setUnreadCount,
        setUnreadMessagesCount,
        fetchUnreadCount,
        markAllNotificationsAsRead,
        showToast,
        toast,
        dismissToast: () => setToast(null),
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
