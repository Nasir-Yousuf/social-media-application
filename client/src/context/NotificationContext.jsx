import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

// Authentic Twitter / X signature notification sound (two-tone melodic chirp)
export const playTwitterNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;

    // Master volume control
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.35, t);
    master.connect(ctx.destination);

    // --- Note 1: Upward initial chirp (grace note) ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1350, t);
    osc1.frequency.exponentialRampToValueAtTime(2150, t + 0.045);

    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(0.4, t + 0.008);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

    osc1.connect(gain1);
    gain1.connect(master);
    osc1.start(t);
    osc1.stop(t + 0.06);

    // --- Note 2: Signature bright Twitter tweet whistle ---
    const t2 = t + 0.055;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2100, t2);
    osc2.frequency.exponentialRampToValueAtTime(3350, t2 + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(2700, t2 + 0.13);

    gain2.gain.setValueAtTime(0, t2);
    gain2.gain.linearRampToValueAtTime(0.7, t2 + 0.012);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.16);

    osc2.connect(gain2);
    gain2.connect(master);
    osc2.start(t2);
    osc2.stop(t2 + 0.17);

    // --- Crystalline overtone layer for modern crispness ---
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(4200, t2);
    osc3.frequency.exponentialRampToValueAtTime(5500, t2 + 0.05);

    gain3.gain.setValueAtTime(0, t2);
    gain3.gain.linearRampToValueAtTime(0.09, t2 + 0.01);
    gain3.gain.exponentialRampToValueAtTime(0.001, t2 + 0.12);

    osc3.connect(gain3);
    gain3.connect(master);
    osc3.start(t2);
    osc3.stop(t2 + 0.13);
  } catch {
    // Audio restrictions fallback
  }
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [toast, setToast] = useState(null);

  const notifiedMessageIdsRef = React.useRef(new Set());
  const notifiedNotificationIdsRef = React.useRef(new Set());
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
      const latestUnreadNotif = notifRes.data.latestUnread;

      const newMsgCount = msgRes.data.unreadTotal || 0;
      const latestUnreadMsg = msgRes.data.latestUnread;

      setUnreadCount(newNotifCount);
      setUnreadMessagesCount(newMsgCount);

      // Handle new incoming general notification (likes, comments, follows, mentions, announcements)
      if (latestUnreadNotif && latestUnreadNotif._id) {
        if (initialLoadRef.current) {
          notifiedNotificationIdsRef.current.add(latestUnreadNotif._id);
        } else if (!notifiedNotificationIdsRef.current.has(latestUnreadNotif._id)) {
          notifiedNotificationIdsRef.current.add(latestUnreadNotif._id);

          const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
          const isViewingNotifications = currentPath.startsWith('/notifications');

          if (!isViewingNotifications) {
            playTwitterNotificationSound();

            let notifText = 'You have a new notification';
            const senderName = latestUnreadNotif.sender?.name || 'Someone';
            if (latestUnreadNotif.type === 'like') {
              notifText = `❤️ ${senderName} appreciated your post`;
            } else if (latestUnreadNotif.type === 'comment') {
              notifText = `💬 ${senderName} responded to your post`;
            } else if (latestUnreadNotif.type === 'follow') {
              notifText = `👤 ${senderName} began following you`;
            } else if (latestUnreadNotif.type === 'mention' || latestUnreadNotif.type === 'question_mention') {
              notifText = `📢 ${senderName} mentioned you`;
            } else if (latestUnreadNotif.type === 'everyone_mention') {
              notifText = `📢 ${senderName} mentioned @everyone`;
            } else if (latestUnreadNotif.type === 'announcement') {
              notifText = `📌 Announcement from ${senderName}`;
            }

            showToast(notifText, 'info', {
              avatarUrl: latestUnreadNotif.sender?.avatarUrl,
              onClick: () => {
                window.location.assign('/notifications');
              },
              duration: 5000,
            });

            // Native Browser Notification
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              try {
                new Notification(`Clearfeed: ${senderName}`, {
                  body: notifText,
                  icon: latestUnreadNotif.sender?.avatarUrl || undefined,
                });
              } catch {}
            }
          }
        }
      }

      // Handle new incoming direct message notification
      if (latestUnreadMsg && latestUnreadMsg._id) {
        if (initialLoadRef.current) {
          notifiedMessageIdsRef.current.add(latestUnreadMsg._id);
        } else if (!notifiedMessageIdsRef.current.has(latestUnreadMsg._id)) {
          notifiedMessageIdsRef.current.add(latestUnreadMsg._id);

          // Only alert if user is not actively viewing this conversation
          const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
          const isViewingThisChat =
            currentUrl.includes('/messages') &&
            currentUrl.includes(`user=${latestUnreadMsg.sender?.username}`);

          if (!isViewingThisChat) {
            playTwitterNotificationSound();
            showToast(
              `💬 ${latestUnreadMsg.sender?.name || 'Someone'}: "${(latestUnreadMsg.text || 'Sent a message').slice(0, 45)}"`,
              'info',
              {
                avatarUrl: latestUnreadMsg.sender?.avatarUrl,
                onClick: () => {
                  window.location.assign(`/messages?user=${latestUnreadMsg.sender?.username}`);
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
                new Notification(`Message from ${latestUnreadMsg.sender?.name || 'Classmate'}`, {
                  body: latestUnreadMsg.text || 'Sent you a direct message.',
                  icon: latestUnreadMsg.sender?.avatarUrl || undefined,
                });
              } catch {}
            }
          }
        }
      }

      initialLoadRef.current = false;
    } catch {
      // Ignore background notification fetch errors
    }
  }, [isAuthenticated, showToast]);

  // Unlock AudioContext and request browser notification permission on user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
          }
        }
      } catch {}

      if (
        isAuthenticated &&
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'default'
      ) {
        Notification.requestPermission().catch(() => {});
      }

      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
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
        playNotificationSound: playTwitterNotificationSound,
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
