import React, { useState, useEffect } from 'react';
import { Users, Search, MessageSquare, Shield, GraduationCap, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { User } from '../types';

interface MembersViewProps {
  onStartChat: (user: User) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({ onStartChat }) => {
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
      m.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            Course Members Directory
          </h2>
          <p className="text-xs text-neutral-400">
            Enrolled cohort members and course instructors (~35 students).
          </p>
        </div>
        <button
          onClick={fetchMembers}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-medium transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name or username..."
          className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Roster Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-500">
          Loading course directory...
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
              className="bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700/80 rounded-2xl p-4 flex flex-col justify-between transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm">
                    {member.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-200">{member.name}</h4>
                    <p className="text-[11px] text-neutral-500">@{member.username}</p>
                  </div>
                </div>

                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    member.role === 'admin'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {member.role === 'admin' ? (
                    <>
                      <Shield className="w-3 h-3" /> Instructor
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-3 h-3" /> Student
                    </>
                  )}
                </span>
              </div>

              {member.bio && (
                <p className="text-xs text-neutral-400 line-clamp-2">{member.bio}</p>
              )}

              <button
                onClick={() => onStartChat(member)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-neutral-800 hover:bg-sky-500 hover:text-white text-neutral-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Direct Message
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersView;
