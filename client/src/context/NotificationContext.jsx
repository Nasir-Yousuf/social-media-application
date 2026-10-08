import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

// Shared singleton AudioContext to comply with browser autoplay policies
let sharedAudioCtx = null;

const getSharedAudioContext = () => {
  try {
    if (!sharedAudioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        sharedAudioCtx = new AudioCtx();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
  } catch {}
  return sharedAudioCtx;
};

// Play authentic, crystal-clear Twitter / X melodic chirp notification sound
export const playTwitterNotificationSound = () => {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;

    // Master volume control
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.45, t);
    master.connect(ctx.destination);

    // Note 1: Bright upward chirp
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1350, t);
    osc1.frequency.exponentialRampToValueAtTime(2150, t + 0.045);

    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(0.45, t + 0.008);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc1.connect(gain1);
    gain1.connect(master);
    osc1.start(t);
    osc1.stop(t + 0.065);

    // Note 2: Signature bright Twitter tweet chime
    const t2 = t + 0.055;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2100, t2);
    osc2.frequency.exponentialRampToValueAtTime(3400, t2 + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(2650, t2 + 0.14);

    gain2.gain.setValueAtTime(0, t2);
    gain2.gain.linearRampToValueAtTime(0.75, t2 + 0.012);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.18);

    osc2.connect(gain2);
    gain2.connect(master);
    osc2.start(t2);
    osc2.stop(t2 + 0.19);

    // Note 3: Crystalline overtone sparkle
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(4200, t2);
    osc3.frequency.exponentialRampToValueAtTime(5600, t2 + 0.05);

    gain3.gain.setValueAtTime(0, t2);
    gain3.gain.linearRampToValueAtTime(0.12, t2 + 0.01);
    gain3.gain.exponentialRampToValueAtTime(0.001, t2 + 0.14);

    osc3.connect(gain3);
    gain3.connect(master);
    osc3.start(t2);
    osc3.stop(t2 + 0.15);
  } catch {
    // Audio restrictions fallback
  }
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [toast, setToast] = useState(null);

  const notifiedMessageIdsRef = useRef(new Set());
  const notifiedNotificationIdsRef = useRef(new Set());
  const initialLoadRef = useRef(true);

  const showToast = useCallback((message, type = 'info', options = {}) => {
    // Play sound on notification toasts unless explicitly muted
    if (options.playSound !== false) {
      playTwitterNotificationSound();
    }

    setToast({
      id: Date.now(),
      message,
      type,
      onClick: options.onClick,
      avatarUrl: options.avatarUrl,
      actionLabel: options.actionLabel,
      actionOnClick: options.actionOnClick,
    });
    setTimeout(() => {
      setToast(null);
    }, options.duration || 5000);
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

      // Handle new incoming general notification (likes, comments, follows, mentions, typing challenges, new posts)
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
            let targetUrl = '/notifications';
            const senderName = latestUnreadNotif.sender?.name || 'Someone';
            const senderUsername = latestUnreadNotif.sender?.username || 'player';

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
              const postContent = latestUnreadNotif.post?.content || 'Check out the new official announcement!';
              const postId = latestUnreadNotif.post?._id || latestUnreadNotif.post;
              notifText = `📌 Announcement from ${senderName}: "${postContent.slice(0, 48)}${postContent.length > 48 ? '...' : ''}"`;
              targetUrl = postId ? `/posts/${postId}` : '/notifications';
              window.dispatchEvent(new CustomEvent('clearfeed:newPost'));
            } else if (latestUnreadNotif.type === 'new_post') {
              const postContent = latestUnreadNotif.post?.content || 'Check out their new update!';
              const postId = latestUnreadNotif.post?._id || latestUnreadNotif.post;
              notifText = `📝 ${senderName} shared a new post: "${postContent.slice(0, 48)}${postContent.length > 48 ? '...' : ''}"`;
              targetUrl = postId ? `/posts/${postId}` : '/notifications';
              window.dispatchEvent(new CustomEvent('clearfeed:newPost'));
            } else if (latestUnreadNotif.type === 'typing_challenge') {
              const tc = latestUnreadNotif.typingChallenge;
              const carId = tc?.carId || 'street_phantom';
              const chId = tc?._id || tc;

              notifText = `🏎️⚡ ${senderName} challenged you to a Highway Supercar Race! Click to race!`;
              targetUrl = `/typing?theme=race&duelWith=${senderUsername}&car=${carId}&challengeId=${chId}`;
            } else if (latestUnreadNotif.type === 'typing_challenge_result') {
              notifText = `🏆 ${senderName} completed your Highway Supercar Race duel!`;
              targetUrl = '/typing?theme=race';
            }

            const isRaceChallenge = latestUnreadNotif.type === 'typing_challenge';
            const isPostAlert = latestUnreadNotif.type === 'new_post' || latestUnreadNotif.type === 'announcement';
            const hasPostLink = Boolean(latestUnreadNotif.post?._id || latestUnreadNotif.post);

            showToast(notifText, 'info', {
              avatarUrl: latestUnreadNotif.sender?.avatarUrl,
              actionLabel: isRaceChallenge ? 'RACE NOW 🏎️' : (isPostAlert && hasPostLink ? 'VIEW POST' : undefined),
              actionOnClick: () => {
                navigate(targetUrl);
              },
              onClick: () => {
                navigate(targetUrl);
              },
              duration: isRaceChallenge ? 10000 : 7000,
            });

            // Native Browser Notification
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              try {
                const nativeNotif = new Notification(`Clearfeed: ${senderName}`, {
                  body: notifText,
                  icon: latestUnreadNotif.sender?.avatarUrl || undefined,
                });
                nativeNotif.onclick = () => {
                  window.focus();
                  navigate(targetUrl);
                };
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
            const msgTargetUrl = `/messages?user=${latestUnreadMsg.sender?.username}`;
            showToast(
              `💬 ${latestUnreadMsg.sender?.name || 'Someone'}: "${(latestUnreadMsg.text || 'Sent a message').slice(0, 45)}"`,
              'info',
              {
                avatarUrl: latestUnreadMsg.sender?.avatarUrl,
                onClick: () => {
                  navigate(msgTargetUrl);
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

  // Unlock shared AudioContext and request browser notification permission on user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      try {
        const ctx = getSharedAudioContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
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
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('pointerdown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });
    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('pointerdown', handleFirstInteraction);
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
    // Poll every 3.5 seconds for snappy real-time race & message alerts
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchUnreadCount();
      }
    }, 3500);

    const handleWindowFocus = () => {
      fetchUnreadCount();
    };
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('visibilitychange', handleWindowFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('visibilitychange', handleWindowFocus);
    };
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
