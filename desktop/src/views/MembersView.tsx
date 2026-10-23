import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, MessageSquare, Shield, GraduationCap, RefreshCw, X } from 'lucide-react';
import api from '../api/client';
import { User } from '../types';
import Avatar from '../components/common/Avatar';
import { FacultyBadge } from '../components/common/ClearfeedIcons';

interface MembersViewProps {
  onStartChat: (user: User) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({ onStartChat }) => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/directory');
      const incoming = res.data?.users || res.data?.members || [];
      setMembers(incoming);
    } catch {
      // Graceful error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.username?.toLowerCase().includes(search.toLowerCase()) ||
      (m.bio && m.bio.toLowerCase().includes(search.toLowerCase())) ||
      (m.status && m.status.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-100">
              Course Members Directory
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-semibold">
              {members.length} members
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Enrolled cohort members and course instructors.
          </p>
        </div>
        <button
          onClick={fetchMembers}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer border border-neutral-800 hover:border-neutral-700 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members by name, @username, or interest..."
          className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl pl-10 pr-9 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Roster Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-4 h-36 flex flex-col justify-between"
            />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="p-12 text-center text-xs text-neutral-500 bg-neutral-900/40 rounded-2xl border border-neutral-800">
          No members matched your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member._id}
              className="bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700/80 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 space-y-3.5 shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  onClick={() => navigate(`/profile/${member.username}`)}
                  className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
                  title={`View @${member.username}'s Profile`}
                >
                  <Avatar
                    user={member}
                    src={member.avatarUrl}
                    name={member.name}
                    size="md"
                    showRoleBadge={false}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-neutral-100 group-hover:text-sky-400 transition-colors truncate">
                        {member.name}
                      </h4>
                      {member.role === 'admin' && (
                        <FacultyBadge className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 truncate">@{member.username}</p>
                    {member.status && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-medium inline-block mt-1">
                        {member.status}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                    member.role === 'admin'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-neutral-800/80 text-neutral-400 border border-neutral-700/50'
                  }`}
                >
                  {member.role === 'admin' ? (
                    <>
                      <Shield className="w-3 h-3 text-amber-400" /> Instructor
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-3 h-3 text-neutral-400" /> Student
                    </>
                  )}
                </span>
              </div>

              {member.bio && (
                <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                  {member.bio}
                </p>
              )}

              <div className="pt-2 border-t border-neutral-800/60">
                <button
                  onClick={() => onStartChat(member)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-neutral-800/90 hover:bg-sky-500 hover:text-white text-neutral-200 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Direct Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersView;
