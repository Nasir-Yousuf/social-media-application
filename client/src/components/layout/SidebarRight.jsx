import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Search, GraduationCap, Calendar, Users, ArrowUpRight, Check } from 'lucide-react';
import api from '../../api/client';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { useNotifications } from '../../context/NotificationContext';

export const SidebarRight = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const res = await api.get('/users/suggestions');
        setSuggestions(res.data.suggestions || []);
      } catch (err) {
        console.warn('Could not load suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleFollowToggle = async (userId, username) => {
    const isCurrentlyFollowing = followingMap[userId];
    try {
      if (isCurrentlyFollowing) {
        await api.delete(`/users/${userId}/follow`);
        setFollowingMap((prev) => ({ ...prev, [userId]: false }));
        showToast(`Unfollowed @${username}`, 'info');
      } else {
        await api.post(`/users/${userId}/follow`);
        setFollowingMap((prev) => ({ ...prev, [userId]: true }));
        showToast(`Now following @${username}`, 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update follow status', 'error');
    }
  };

  return (
    <aside className="hidden xl:flex flex-col gap-6 w-80 h-screen sticky top-0 px-4 py-6 border-l border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl overflow-y-auto">
      {/* Search Input Widget */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search course posts, classmates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900/90 text-sm text-zinc-200 placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 transition-all"
        />
      </form>

      {/* Course Community Metadata Card */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-4 flex flex-col gap-3 shadow-lg shadow-black/20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-zinc-100">CS-518: Web Architecture</h4>
            <p className="text-xs text-zinc-400">Spring 2026 Semester</p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-2.5">
          Private collaboration hub for our 35 cohort members. Share project updates, ask architecture questions, and coordinate labs.
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-zinc-300">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>35 Students</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-zinc-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Labs Tue/Thu</span>
          </div>
        </div>
      </div>

      {/* Classmates to Follow Widget */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-4 flex flex-col gap-3 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-zinc-100">Classmates to Connect With</h4>
          <NavLink
            to="/members"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
          >
            <span>All 35</span>
            <ArrowUpRight className="w-3 h-3" />
          </NavLink>
        </div>

        {loadingSuggestions ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-zinc-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-zinc-800 rounded w-24" />
                  <div className="h-2.5 bg-zinc-800/60 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-xs text-zinc-500 py-2">You are following all suggested classmates!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {suggestions.map((student) => {
              const isFollowing = followingMap[student._id];
              return (
                <div key={student._id} className="flex items-center justify-between gap-2">
                  <NavLink
                    to={`/profile/${student.username}`}
                    className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity"
                  >
                    <Avatar src={student.avatarUrl} name={student.name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 truncate hover:text-indigo-400">
                        {student.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">@{student.username}</p>
                    </div>
                  </NavLink>

                  <Button
                    variant={isFollowing ? 'outline' : 'primary'}
                    size="xs"
                    onClick={() => handleFollowToggle(student._id, student.username)}
                    className="shrink-0"
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Following</span>
                      </>
                    ) : (
                      <span>Follow</span>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Course Sprint Milestones */}
      <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800/60 p-4 text-xs text-zinc-400 flex flex-col gap-2">
        <span className="font-semibold text-zinc-300">Spring 2026 Deadlines</span>
        <div className="flex items-start gap-2 pt-1 border-t border-zinc-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
          <div>
            <p className="text-zinc-200 font-medium">Sprint 1 Demo: Architecture Check</p>
            <p className="text-[11px] text-zinc-400">Oct 10 • Lab Room 402B</p>
          </div>
        </div>
        <div className="flex items-start gap-2 pt-1 border-t border-zinc-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
          <div>
            <p className="text-zinc-200 font-medium">Database Schema Peer Review</p>
            <p className="text-[11px] text-zinc-400">Oct 17 • Submit in Discourse</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarRight;
