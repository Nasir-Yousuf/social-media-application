import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Flame,
  CheckCheck,
  AtSign,
  MessageSquare,
  Volume2,
  BookOpen,
  Radio,
  Swords,
  Trophy,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/client';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { useNotifications } from '../context/NotificationContext';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const { setUnreadCount, showToast, markAllNotificationsAsRead, playNotificationSound } = useNotifications();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      const list = res.data.notifications || [];
      setNotifications(list);

      // Whenever a user sees the notification page, the unread badge numbers go away
      const hasUnread = list.some((n) => !n.read);
      if (hasUnread) {
        setUnreadCount(0);
        window.dispatchEvent(new CustomEvent('clearfeed:notificationsRead'));
        await api.patch('/notifications/mark-read', {});
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } else {
        setUnreadCount(0);
      }
    } catch (err) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Immediately clear notification badge numbers when user lands on Notifications page
    setUnreadCount(0);
    window.dispatchEvent(new CustomEvent('clearfeed:notificationsRead'));
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent('clearfeed:notificationsRead'));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await api.patch('/notifications/mark-read', {});
      showToast('All alerts marked as read', 'success');
    } catch (err) {
      showToast('Failed to mark notifications read', 'error');
    }
  };

  const getNotificationIcon = (type, notif) => {
    switch (type) {
      case 'like':
        return (
          <div className="p-2 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 ring-1 ring-rose-200 dark:ring-rose-900/50">
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
        );
      case 'comment':
        return (
          <div className="p-2 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-500 ring-1 ring-sky-200 dark:ring-sky-900/50">
            <MessageCircle className="w-4 h-4" />
          </div>
        );
      case 'mention':
      case 'question_mention':
        return (
          <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-500 ring-1 ring-purple-200 dark:ring-purple-900/50">
            <AtSign className="w-4 h-4" />
          </div>
        );
      case 'everyone_mention':
        return (
          <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 ring-1 ring-amber-200 dark:ring-amber-900/50">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
        );
      case 'message':
        return (
          <div className="p-2 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-500 ring-1 ring-sky-200 dark:ring-sky-900/50">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
      case 'follow':
        return (
          <div className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 ring-1 ring-emerald-200 dark:ring-emerald-900/50">
            <UserPlus className="w-4 h-4" />
          </div>
        );
      case 'announcement':
        return (
          <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 ring-1 ring-amber-200 dark:ring-amber-900/50">
            <Flame className="w-4 h-4" />
          </div>
        );
      case 'question_answer':
        return (
          <div className="p-2 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-500 ring-1 ring-sky-200 dark:ring-sky-900/50">
            <BookOpen className="w-4 h-4" />
          </div>
        );
      case 'question_accepted':
        return (
          <div className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 ring-1 ring-emerald-200 dark:ring-emerald-900/50">
            <CheckCheck className="w-4 h-4" />
          </div>
        );
      case 'typing_challenge':
        if (notif?.typingChallenge?.isRace || notif?.typingChallenge?.mode === 'race_highway') {
          return (
            <div className="p-2 rounded-full bg-gradient-to-br from-red-500/20 via-slate-900 to-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.4)] animate-pulse">
              <Flame className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            </div>
          );
        }
        return (
          <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 ring-1 ring-amber-200 dark:ring-amber-900/50 animate-pulse">
            <Swords className="w-4 h-4" />
          </div>
        );
      case 'typing_challenge_result':
        return (
          <div className="p-2 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-500 ring-1 ring-sky-200 dark:ring-sky-900/50">
            <Trophy className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 ring-1 ring-neutral-200 dark:ring-neutral-700">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'messages') return n.type === 'message';
    if (activeFilter === 'mentions')
      return n.type === 'mention' || n.type === 'question_mention' || n.type === 'everyone_mention';
    if (activeFilter === 'likes') return n.type === 'like';
    if (activeFilter === 'comments') return n.type === 'comment';
    if (activeFilter === 'follows') return n.type === 'follow';
    return true;
  });

  return (
    <div className="p-4 sm:p-5 space-y-6 font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Notifications</h1>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-sans">
            Direct interactions: messages, mentions, replies, appreciations, and new connections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playNotificationSound();
              showToast('Playing Twitter notification sound 🔔', 'info');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-sky-500 dark:hover:text-sky-400 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-neutral-200 dark:border-neutral-700/60 transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Preview Twitter notification sound"
          >
            <Volume2 className="w-3.5 h-3.5 text-sky-500" />
            <span>Test Sound</span>
          </button>

          {notifications.some((n) => !n.read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs px-3 font-semibold"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
        {[
          { id: 'all', label: 'All' },
          { id: 'messages', label: 'Messages' },
          { id: 'mentions', label: 'Mentions' },
          { id: 'likes', label: 'Likes' },
          { id: 'comments', label: 'Comments' },
          { id: 'follows', label: 'Followers' },
        ].map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/25 ring-2 ring-sky-500/30'
                  : 'bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 h-20" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-400">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">No alerts found</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto font-sans leading-relaxed">
            When someone sends you a message, responds to your posts, or follows your work, you will see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 shadow-2xs ${
                !n.read
                  ? 'bg-sky-50/60 dark:bg-sky-500/10 border-sky-200/80 dark:border-sky-500/30'
                  : 'bg-white dark:bg-[#121519] border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="shrink-0 pt-0.5">{getNotificationIcon(n.type, n)}</div>

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
                  <span className="text-[11px] text-neutral-400 font-sans">{formatTime(n.createdAt)}</span>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 ml-auto" />
                  )}
                </div>

                <p className="text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
                  {n.sender && (
                    <NavLink
                      to={`/profile/${n.sender.username}`}
                      className="font-bold hover:underline mr-1 text-neutral-900 dark:text-white"
                    >
                      {n.sender.name}
                    </NavLink>
                  )}
                  {n.type === 'message' && 'sent you a direct message.'}
                  {n.type === 'like' && 'appreciated your post.'}
                  {n.type === 'comment' && 'responded to your post.'}
                  {n.type === 'mention' && (n.comment ? 'mentioned you in a response.' : 'mentioned you in a post.')}
                  {n.type === 'question_mention' && 'mentioned you in a learning question or answer.'}
                  {n.type === 'everyone_mention' && (n.question ? 'broadcasted an @everyone mention in a question/answer.' : 'broadcasted an @everyone mention to the community.')}
                  {n.type === 'follow' && 'began following your updates.'}
                  {n.type === 'announcement' && 'published an announcement.'}
                  {n.type === 'question_answer' && 'answered your question on Learn & Practice.'}
                  {n.type === 'question_accepted' && 'marked your answer as the accepted solution! 🎉'}
                  {n.type === 'typing_challenge' && (
                    n.typingChallenge?.isRace || n.typingChallenge?.mode === 'race_highway'
                      ? 'challenged you to a Highway Supercar Race in Typing Arena! 🏎️⚡'
                      : 'challenged you to a 1v1 Typing Duel in Clearfeed Arena! ⚡'
                  )}
                  {n.type === 'typing_challenge_result' && 'completed your 1v1 Typing Duel!'}
                </p>

                {n.type === 'message' && (
                  <div className="mt-2">
                    <NavLink
                      to={`/messages?user=${n.sender?.username}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-xs hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Reply to message</span>
                    </NavLink>
                  </div>
                )}

                {n.type === 'typing_challenge' && (
                  <div className="mt-2.5 flex items-center gap-2">
                    {n.typingChallenge?.isRace || n.typingChallenge?.mode === 'race_highway' ? (
                      <NavLink
                        to={`/typing?theme=race&duelWith=${n.sender?.username}&car=${n.typingChallenge?.carId || 'street_phantom'}&challengeId=${n.typingChallenge?._id || n.typingChallenge}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 via-amber-500 to-cyan-400 hover:from-red-400 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
                      >
                        <Flame className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                        <span>🏎️ Start Race Against @{n.sender?.username} &rarr;</span>
                      </NavLink>
                    ) : (
                      <NavLink
                        to={`/typing?challengeId=${n.typingChallenge?._id || n.typingChallenge}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-xs transition-transform active:scale-95"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Accept & Race Rival &rarr;</span>
                      </NavLink>
                    )}
                  </div>
                )}

                {n.type === 'typing_challenge_result' && (
                  <div className="mt-2">
                    <NavLink
                      to="/typing"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-xs hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>View Duel Results</span>
                    </NavLink>
                  </div>
                )}

                {n.post && (
                  <NavLink
                    to={`/posts/${n.post._id || n.post}`}
                    className="block text-xs text-neutral-500 dark:text-neutral-400 hover:text-sky-500 dark:hover:text-sky-400 line-clamp-1 mt-1 font-serif italic transition-colors"
                  >
                    "{n.post.content || 'View post'}"
                  </NavLink>
                )}

                {n.question && (
                  <NavLink
                    to={`/learn/questions/${n.question._id || n.question}`}
                    className="inline-flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:underline line-clamp-1 mt-1 font-semibold transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>"{n.question.title || 'View question'}"</span>
                  </NavLink>
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
