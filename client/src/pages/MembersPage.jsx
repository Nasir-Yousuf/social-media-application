import React, { useState, useEffect } from 'react';
import { Users, Search, X } from 'lucide-react';
import api from '../api/client';
import MemberCard from '../components/users/MemberCard';
import { useNotifications } from '../context/NotificationContext';

export const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'member', 'admin'
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotifications();

  useEffect(() => {
    const fetchDirectory = async () => {
      setLoading(true);
      try {
        const res = await api.get('/users/directory');
        setMembers(res.data.members || []);
      } catch (err) {
        showToast('Failed to load community members', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDirectory();
  }, [showToast]);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.username.toLowerCase().includes(search.toLowerCase()) ||
      (m.bio && m.bio.toLowerCase().includes(search.toLowerCase())) ||
      (m.status && m.status.toLowerCase().includes(search.toLowerCase()));

    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'admin'
        ? m.role === 'admin'
        : m.role !== 'admin';

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-5 font-sans">
      {/* Header */}
      <div className="pb-3 border-b cf-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--color-cf-accent)]" />
            <h1 className="text-xl font-bold tracking-tight cf-text">Community</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full cf-surface border cf-border text-xs cf-text-muted font-semibold">
              {members.length} members
            </span>
          </div>
          <p className="text-xs cf-text-muted mt-0.5 font-serif italic">
            Connect with thinkers, writers, and developers.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 cf-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name, @username, or interest..."
            className="w-full cf-bg text-sm cf-text placeholder:cf-text-muted pl-10 pr-4 py-2.5 rounded-lg border cf-border focus:outline-none cf-focus-ring"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-xs cf-text-muted hover:cf-text cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 select-none">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold cf-btn-transition cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-[var(--color-cf-accent)] text-white shadow-sm'
                : 'cf-surface border cf-border cf-text hover:bg-[var(--color-cf-elevated)] dark:hover:bg-[var(--color-cfd-elevated)]'
            }`}
          >
            All Members
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold cf-btn-transition cursor-pointer ${
              roleFilter === 'admin'
                ? 'bg-[var(--color-cf-amber)] text-black shadow-sm font-bold'
                : 'cf-surface border cf-border cf-text hover:bg-[var(--color-cf-elevated)] dark:hover:bg-[var(--color-cfd-elevated)]'
            }`}
          >
            Staff & Admins
          </button>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl cf-surface border cf-border animate-pulse h-28" />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="py-16 text-center cf-surface border cf-border rounded-xl">
          <p className="text-sm font-semibold cf-text">No members match your search.</p>
          <p className="text-xs cf-text-muted mt-1">Try another keyword or clear the search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredMembers.map((member) => (
            <MemberCard key={member._id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersPage;
