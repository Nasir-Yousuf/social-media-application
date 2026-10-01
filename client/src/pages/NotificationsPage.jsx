import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Flame,
  CheckCheck,
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
      showToast('All alerts marked as read', 'success');
    } catch (err) {
      showToast('Failed to mark notifications read', 'error');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-[var(--color-cf-like)] fill-[var(--color-cf-like)]" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-[var(--color-cf-accent)]" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-[var(--color-cf-accent)]" />;
      case 'announcement':
        return <Flame className="w-5 h-5 text-[var(--color-cf-amber)]" />;
      default:
        return <Bell className="w-5 h-5 cf-text-muted" />;
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
    <div className="space-y-5 font-sans">
      {/* Header */}
      <div className="pb-3 border-b cf-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[var(--color-cf-accent)]" />
            <h1 className="text-xl font-bold tracking-tight cf-text">Notifications</h1>
          </div>
          <p className="text-xs cf-text-muted mt-0.5 font-serif italic">
            Direct interactions: replies, appreciations, and new connections.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <Button variant="outline" size="xs" onClick={handleMarkAllRead} className="text-xs px-3">
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl cf-surface border cf-border h-16" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center cf-surface border cf-border rounded-xl">
          <Bell className="w-8 h-8 mx-auto mb-2 cf-text-muted" />
          <p className="text-sm font-semibold cf-text">No alerts yet</p>
          <p className="text-xs cf-text-muted mt-1 font-serif italic">
            When someone responds to your posts or follows your work, you will see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-xl border cf-border cf-btn-transition flex items-start gap-3.5 ${
                !n.read
                  ? 'bg-[var(--color-cf-accent-soft)]/40 dark:bg-[var(--color-cfd-accent-soft)]/20'
                  : 'cf-surface'
              }`}
            >
              <div className="pt-0.5">{getNotificationIcon(n.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {n.sender && (
                    <NavLink to={`/profile/${n.sender.username}`} className="shrink-0">
                      <Avatar
                        src={n.sender.avatarUrl}
                        name={n.sender.name}
                        size="xs"
                        role={n.sender.role}
                      />
                    </NavLink>
                  )}
                  <span className="text-xs cf-text-muted">{formatTime(n.createdAt)}</span>
                </div>

                <p className="text-sm cf-text leading-snug">
                  {n.sender && (
                    <NavLink
                      to={`/profile/${n.sender.username}`}
                      className="font-bold hover:underline mr-1"
                    >
                      {n.sender.name}
                    </NavLink>
                  )}
                  {n.type === 'like' && 'appreciated your post.'}
                  {n.type === 'comment' && 'responded to your post.'}
                  {n.type === 'follow' && 'began following your updates.'}
                  {n.type === 'announcement' && 'published an announcement.'}
                </p>

                {n.post && (
                  <p className="text-xs cf-text-muted line-clamp-1 mt-1 font-serif italic">
                    "{n.post.content}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
