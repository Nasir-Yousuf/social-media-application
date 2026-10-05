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
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Community</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 text-neutral-600 dark:text-neutral-400 font-semibold">
              {members.length} members
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-sans">
            Connect with thinkers, writers, and developers.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name, @username, or interest..."
            className="w-full bg-white dark:bg-[#121519] text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 pl-11 pr-10 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 select-none">
          {[
            { id: 'all', label: 'All Members' },
            { id: 'admin', label: 'Faculty / Staff' },
            { id: 'member', label: 'Students / Peers' },
          ].map((tab) => {
            const isActive = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
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
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 h-36" />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xs">
          <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">No members found</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Try another search keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredMembers.map((m) => (
            <MemberCard key={m._id} member={m} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersPage;
