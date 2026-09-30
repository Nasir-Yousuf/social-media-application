import React, { useState, useEffect } from 'react';
import { Users, Search, Filter } from 'lucide-react';
import api from '../api/client';
import MemberCard from '../components/users/MemberCard';
import { useNotifications } from '../context/NotificationContext';

export const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'student', 'admin'
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotifications();

  useEffect(() => {
    const fetchDirectory = async () => {
      setLoading(true);
      try {
        const res = await api.get('/users/directory');
        setMembers(res.data.members || []);
      } catch (err) {
        showToast('Failed to load course members directory', 'error');
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
      (m.bio && m.bio.toLowerCase().includes(search.toLowerCase()));

    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'admin'
        ? m.role === 'admin'
        : m.role === 'student';

    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-extrabold tracking-tight text-zinc-100">
              Course 518 Members
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
              {members.length} Enrolled
            </span>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">
          Directory of all verified students and faculty in CS-518
        </p>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search classmates by name, @username, or interest..."
              className="w-full bg-zinc-900 text-xs text-zinc-200 placeholder-zinc-500 pl-9 pr-4 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                roleFilter === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              All ({members.length})
            </button>
            <button
              onClick={() => setRoleFilter('student')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                roleFilter === 'student'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Students ({members.filter((m) => m.role === 'student').length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                roleFilter === 'admin'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Faculty ({members.filter((m) => m.role === 'admin').length})
            </button>
          </div>
        </div>
      </header>

      {/* Roster Grid */}
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-zinc-800 rounded w-1/3" />
                    <div className="h-3 bg-zinc-800/60 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-3 bg-zinc-800/40 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center text-zinc-400">
            <p className="text-sm font-semibold text-zinc-300">No course members found</p>
            <p className="text-xs text-zinc-500 mt-1">Try adjusting your search query or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMembers.map((member) => (
              <MemberCard key={member._id} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersPage;
