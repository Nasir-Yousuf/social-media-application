import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Sparkles, TrendingUp, UserPlus, Check, MoreHorizontal } from 'lucide-react';
import Avatar from '../common/Avatar';
import api from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';

export const RightSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [trends, setTrends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [followingMap, setFollowingMap] = useState({});
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  useEffect(() => {
    let isMounted = true;

    // Fetch trending hashtags
    const fetchTrends = async () => {
      try {
        const res = await api.get('/posts/trending-hashtags');
        if (isMounted) {
          setTrends(res.data.trends || []);
        }
      } catch (err) {
        if (isMounted) {
          setTrends([]);
        }
      } finally {
        if (isMounted) setLoadingTrends(false);
      }
    };

    // Fetch who to follow suggestions
    const fetchSuggestions = async () => {
      try {
        const res = await api.get('/users/suggestions');
        if (isMounted) {
          setSuggestions((res.data.suggestions || []).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load user suggestions:', err);
      } finally {
        if (isMounted) setLoadingSuggestions(false);
      }
    };

    fetchTrends();
    fetchSuggestions();

    const handleRefreshTrends = () => fetchTrends();
    window.addEventListener('clearfeed:newPost', handleRefreshTrends);

    const handleFollowUpdated = (e) => {
      const detail = e.detail;
      if (detail?.userId && typeof detail.isFollowing === 'boolean') {
        setFollowingMap((prev) => ({ ...prev, [detail.userId]: detail.isFollowing }));
        setSuggestions((prev) =>
          prev.map((s) =>
            s._id === detail.userId
              ? {
                  ...s,
                  followersCount:
                    typeof detail.followersCount === 'number' ? detail.followersCount : s.followersCount,
                }
              : s
          )
        );
      }
    };
    window.addEventListener('clearfeed:followUpdated', handleFollowUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('clearfeed:newPost', handleRefreshTrends);
      window.removeEventListener('clearfeed:followUpdated', handleFollowUpdated);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleTrendClick = (hashtag) => {
    navigate(`/search?q=${encodeURIComponent('#' + hashtag)}`);
  };

  const handleFollowToggle = async (userId, username) => {
    const isCurrentlyFollowing = !!followingMap[userId];
    const newStatus = !isCurrentlyFollowing;

    setFollowingMap((prev) => ({ ...prev, [userId]: newStatus }));

    try {
      if (newStatus) {
        const res = await api.post(`/users/${userId}/follow`);
        showToast(`Following @${username}`, 'success');

        window.dispatchEvent(
          new CustomEvent('clearfeed:followUpdated', {
            detail: {
              userId,
              username,
              isFollowing: true,
              followersCount: res.data.followersCount,
              currentUserFollowingCount: res.data.currentUserFollowingCount,
              currentUserFollowersCount: res.data.currentUserFollowersCount,
            },
          })
        );
      } else {
        const res = await api.delete(`/users/${userId}/follow`);
        showToast(`Unfollowed @${username}`, 'info');

        window.dispatchEvent(
          new CustomEvent('clearfeed:followUpdated', {
            detail: {
              userId,
              username,
              isFollowing: false,
              followersCount: res.data.followersCount,
              currentUserFollowingCount: res.data.currentUserFollowingCount,
              currentUserFollowersCount: res.data.currentUserFollowersCount,
            },
          })
        );
      }
    } catch (err) {
      setFollowingMap((prev) => ({ ...prev, [userId]: isCurrentlyFollowing }));
      showToast('Could not update follow status', 'error');
    }
  };

  return (
    <aside className="hidden lg:flex flex-col sticky top-0 h-screen max-h-screen w-80 xl:w-90 px-3 pt-1 pb-16 overflow-y-auto shrink-0 z-20 self-start overscroll-contain sidebar-scroll">
      {/* Twitter Search Bar - Sticky Header */}
      <div className="sticky top-0 z-10 pt-2 pb-3 bg-white/95 dark:bg-black/95 backdrop-blur-md">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Clearfeed"
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-neutral-100 dark:bg-[#16181c] border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-black text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-500 outline-none transition-all duration-200"
          />
        </form>
      </div>

      <div className="flex flex-col gap-4 pb-8">
        {/* "What's happening" / Trending Hashtags Card */}
      <div className="rounded-2xl bg-neutral-100/70 dark:bg-[#16181c] border border-neutral-200/60 dark:border-neutral-800/80 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <h2 className="font-sans font-black text-lg tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <span>What's happening</span>
            <Sparkles className="w-4 h-4 text-sky-500" />
          </h2>
        </div>

        {loadingTrends ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-1.5">
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : trends.length === 0 ? (
          <div className="px-4 py-5 text-center text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
            <p className="font-semibold text-neutral-700 dark:text-neutral-300">No trending topics yet</p>
            <p className="text-[11px] leading-relaxed max-w-[200px] mx-auto text-neutral-400 dark:text-neutral-500">
              Use <span className="font-bold text-sky-500">#hashtags</span> in your posts to start what's happening!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200/40 dark:divide-neutral-800/60">
            {trends.map((item, idx) => (
              <div
                key={item.hashtag || idx}
                onClick={() => handleTrendClick(item.hashtag)}
                className="px-4 py-2.5 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer flex items-start justify-between group"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    {item.category || 'Topic · Trending'}
                  </p>
                  <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:underline truncate">
                    #{item.hashtag}
                  </p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    {item.postsCount} {item.postsCount === 1 ? 'post' : 'posts'}
                  </p>
                </div>
                <div className="p-1 rounded-full text-neutral-400 hover:text-sky-500 transition-colors">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}

            <NavLink
              to="/explore"
              className="block px-4 py-3 text-xs font-semibold text-sky-500 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors"
            >
              Show more
            </NavLink>
          </div>
        )}
      </div>

      {/* "Who to follow" Suggested Members Card */}
      {suggestions.length > 0 && (
        <div className="rounded-2xl bg-neutral-100/70 dark:bg-[#16181c] border border-neutral-200/60 dark:border-neutral-800/80 overflow-hidden">
          <div className="px-4 pt-3.5 pb-2">
            <h2 className="font-sans font-black text-lg tracking-tight text-neutral-900 dark:text-white">
              Who to follow
            </h2>
          </div>

          <div className="divide-y divide-neutral-200/40 dark:divide-neutral-800/60">
            {suggestions.map((u) => {
              const isFollowing = !!followingMap[u._id];

              return (
                <div
                  key={u._id}
                  className="px-4 py-3 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors flex items-center justify-between gap-2"
                >
                  <NavLink
                    to={`/profile/${u.username}`}
                    className="flex items-center gap-2.5 min-w-0 group"
                  >
                    <Avatar
                      src={u.avatarUrl}
                      name={u.name}
                      size="sm"
                      showRoleBadge={false}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-neutral-900 dark:text-neutral-100 group-hover:underline truncate">
                        {u.name}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                        @{u.username}
                      </p>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-sans">
                        {u.followersCount ?? 0} {u.followersCount === 1 ? 'follower' : 'followers'}
                      </p>
                    </div>
                  </NavLink>

                  <button
                    onClick={() => handleFollowToggle(u._id, u.username)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer shrink-0 ${
                      isFollowing
                        ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 border border-neutral-300 dark:border-neutral-700'
                        : 'bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 shadow-xs'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}

            <NavLink
              to="/members"
              className="block px-4 py-3 text-xs font-semibold text-sky-500 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors"
            >
              Show more members
            </NavLink>
          </div>
        </div>
      )}

      {/* Footer Info / Links */}
      <footer className="px-4 py-2 text-[11px] text-neutral-400 dark:text-neutral-500 space-y-1">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <NavLink to="/explore" className="hover:underline">Explore</NavLink>
          <span>·</span>
          <NavLink to="/code" className="hover:underline">CodeHub</NavLink>
          <span>·</span>
          <NavLink to="/digest" className="hover:underline">Digest</NavLink>
          <span>·</span>
          <NavLink to="/members" className="hover:underline">Directory</NavLink>
        </div>
        <p>© 2026 Clearfeed · Anti-Algorithm Network</p>
      </footer>
      </div>
    </aside>
  );
};

export default RightSidebar;
