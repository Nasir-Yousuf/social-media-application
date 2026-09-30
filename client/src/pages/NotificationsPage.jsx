import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Megaphone,
  CheckCheck,
  Inbox
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/client';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { useNotifications } from '../context/NotificationContext';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadCount, showToast } = useNotifications();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast('Failed to mark notifications read', 'error');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-indigo-400" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-extrabold tracking-tight text-zinc-100">Course Notifications</h1>
        </div>

        {notifications.some((n) => !n.read) && (
          <Button variant="outline" size="xs" onClick={handleMarkAllRead}>
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </Button>
        )}
      </header>

      {/* Notifications List */}
      {loading ? (
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-zinc-800 rounded w-1/2" />
                <div className="h-3 bg-zinc-800/60 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-20 px-4 text-center flex flex-col items-center justify-center gap-3 text-zinc-400">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
            <Inbox className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-zinc-200">All caught up!</p>
          <p className="text-xs text-zinc-500 max-w-xs">
            When classmates like your posts, reply with comments, or follow you, updates will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/80">
          {notifications.map((notif) => {
            const sender = notif.sender || {};
            return (
              <div
                key={notif._id}
                className={`p-4 md:px-5 flex items-start gap-3.5 transition-colors ${
                  !notif.read ? 'bg-indigo-950/15' : 'hover:bg-zinc-900/40'
                }`}
              >
                <div className="mt-1">{getNotificationIcon(notif.type)}</div>

                <NavLink to={`/profile/${sender.username}`}>
                  <Avatar
                    src={sender.avatarUrl}
                    name={sender.name}
                    size="sm"
                    role={sender.role}
                  />
                </NavLink>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 leading-snug">
                    <NavLink
                      to={`/profile/${sender.username}`}
                      className="font-bold text-zinc-100 hover:text-indigo-400"
                    >
                      {sender.name}
                    </NavLink>{' '}
                    <span className="text-zinc-400">
                      {notif.type === 'like' && 'liked your post'}
                      {notif.type === 'comment' && 'commented on your post'}
                      {notif.type === 'follow' && 'started following your updates'}
                      {notif.type === 'announcement' && 'broadcasted an official course announcement'}
                    </span>
                  </p>

                  {notif.post && notif.post.content && (
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1 italic bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/60">
                      "{notif.post.content}"
                    </p>
                  )}

                  <span className="text-[11px] text-zinc-500 block mt-1">
                    {formatTime(notif.createdAt)}
                  </span>
                </div>

                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
